const tls = require("node:tls");
const { URL } = require("node:url");
const { isIP } = require("node:net");
const { lookup } = require("node:dns/promises");

const DEFAULT_TLS_PORT = 443;
const DEFAULT_TIMEOUT_MS = 5000;
const NETWORK_ERROR_CODE_PATTERN =
  /\b(ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|ECONNRESET|EHOSTUNREACH|ENETUNREACH)\b/i;

function formatDistinguishedName(distinguishedName = {}) {
  if (!distinguishedName || typeof distinguishedName !== "object") {
    return "";
  }

  return Object.entries(distinguishedName)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

function parseCertificateDate(value = "") {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function calculateDaysUntilExpiry(validToDate) {
  if (!(validToDate instanceof Date) || Number.isNaN(validToDate.getTime())) {
    return null;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((validToDate.getTime() - Date.now()) / millisecondsPerDay);
}

function normalizeHostname(hostname = "") {
  return String(hostname).toLowerCase().replace(/\.$/, "");
}

function hostnameMatchesPattern(hostname = "", pattern = "") {
  const normalizedHostname = normalizeHostname(hostname);
  const normalizedPattern = normalizeHostname(pattern);

  if (!normalizedHostname || !normalizedPattern) {
    return false;
  }

  if (normalizedPattern.startsWith("*.")) {
    const baseDomain = normalizedPattern.slice(2);
    if (!baseDomain || normalizedHostname === baseDomain) {
      return false;
    }

    const hostnameLabels = normalizedHostname.split(".");
    const baseDomainLabels = baseDomain.split(".");

    if (hostnameLabels.length !== baseDomainLabels.length + 1) {
      return false;
    }

    return hostnameLabels.slice(1).join(".") === baseDomain;
  }

  return normalizedHostname === normalizedPattern;
}

function extractSubjectCommonName(subject = {}) {
  if (!subject || typeof subject !== "object") {
    return "";
  }

  return String(subject.CN || "");
}

function parseSubjectAltNames(subjectAltName = "") {
  return String(subjectAltName)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^DNS:/i, "").trim())
    .filter(Boolean);
}

function determineHostnameMatchesCertificate(hostname = "", certificate = {}) {
  const subjectCommonName = extractSubjectCommonName(certificate.subject);
  const altNames = parseSubjectAltNames(certificate.subjectaltname);
  const candidates = [subjectCommonName, ...altNames].filter(Boolean);

  if (candidates.length === 0) {
    return false;
  }

  return candidates.some((candidate) => hostnameMatchesPattern(hostname, candidate));
}

function extractNetworkErrorCode(error = "", explicitCode = "") {
  if (explicitCode) {
    return String(explicitCode).toUpperCase();
  }

  const message = String(error || "");
  const match = message.match(NETWORK_ERROR_CODE_PATTERN);
  return match ? match[1].toUpperCase() : "";
}

function buildFailureResult({ hasHttps, error, errorCode = "" }) {
  return {
    hasHttps,
    hasCertificate: false,
    certificateTrusted: false,
    certificateAuthorizationError: "",
    certificateValid: false,
    isExpired: false,
    daysUntilExpiry: null,
    hostnameMatchesCertificate: false,
    validFrom: "",
    validTo: "",
    issuer: "",
    subject: "",
    subjectAltName: "",
    fingerprint: "",
    serialNumber: "",
    error,
    errorCode: extractNetworkErrorCode(error, errorCode),
  };
}

function isPrivateOrLocalIp(address = "") {
  const normalizedAddress = String(address).toLowerCase();
  const version = isIP(normalizedAddress);

  if (version === 4) {
    const [first, second] = normalizedAddress.split(".").map(Number);
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 198 && (second === 18 || second === 19))
    );
  }

  if (version === 6) {
    if (normalizedAddress === "::" || normalizedAddress === "::1") return true;
    if (normalizedAddress.startsWith("fc") || normalizedAddress.startsWith("fd")) {
      return true;
    }
    if (normalizedAddress.startsWith("fe80:")) return true;

    const mappedIpv4 = normalizedAddress.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mappedIpv4 ? isPrivateOrLocalIp(mappedIpv4[1]) : false;
  }

  return false;
}

async function resolvePublicTlsTarget(hostname = "") {
  const normalizedHostname = normalizeHostname(hostname);

  if (!normalizedHostname || normalizedHostname === "localhost" || normalizedHostname.endsWith(".local")) {
    const error = new Error("The SSL target must be a public host");
    error.code = "UNSAFE_TLS_TARGET";
    throw error;
  }

  if (isIP(normalizedHostname)) {
    if (isPrivateOrLocalIp(normalizedHostname)) {
      const error = new Error("The SSL target must not use a private IP address");
      error.code = "UNSAFE_TLS_TARGET";
      throw error;
    }

    return { address: normalizedHostname, family: isIP(normalizedHostname) };
  }

  const addresses = await lookup(normalizedHostname, {
    all: true,
    verbatim: true,
  });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateOrLocalIp(address))
  ) {
    const error = new Error("The SSL target resolves to a private or unsafe address");
    error.code = "UNSAFE_TLS_TARGET";
    throw error;
  }

  return addresses[0];
}

function buildNoHttpsResult() {
  return buildFailureResult({
    hasHttps: false,
    error: "The URL does not use HTTPS",
  });
}

async function getSslCertificateDetails(inputUrl, options = {}) {
  let parsedUrl;

  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    return buildFailureResult({
      hasHttps: false,
      error: "The URL is invalid",
    });
  }

  if (parsedUrl.protocol !== "https:") {
    return buildNoHttpsResult();
  }

  const hostname = parsedUrl.hostname;
  const port = parsedUrl.port ? Number(parsedUrl.port) : DEFAULT_TLS_PORT;
  const timeoutMs =
    Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
      ? options.timeoutMs
      : DEFAULT_TIMEOUT_MS;

  let tlsTarget;
  try {
    tlsTarget = await resolvePublicTlsTarget(hostname);
  } catch (error) {
    return buildFailureResult({
      hasHttps: true,
      error: error.message || "The SSL target could not be validated",
      errorCode: error.code || "",
    });
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);

      if (socket && !socket.destroyed) {
        socket.destroy();
      }

      resolve(result);
    };

    const socket = tls.connect(
      {
        host: tlsTarget.address,
        family: tlsTarget.family,
        port,
        servername: hostname,
        rejectUnauthorized: false,
      },
      () => {
        try {
          const certificate = socket.getPeerCertificate();

          if (!certificate || Object.keys(certificate).length === 0) {
            finish(
              buildFailureResult({
                hasHttps: true,
                error: "No SSL certificate was presented by the server",
              }),
            );
            return;
          }

          const now = new Date();
          const validFromDate = parseCertificateDate(certificate.valid_from);
          const validToDate = parseCertificateDate(certificate.valid_to);
          const isExpired =
            validToDate instanceof Date ? validToDate.getTime() < now.getTime() : false;
          const certificateValid = Boolean(
            validFromDate &&
              validToDate &&
              now.getTime() >= validFromDate.getTime() &&
              now.getTime() <= validToDate.getTime(),
          );
          const subjectAltName = certificate.subjectaltname || "";

          finish({
            hasHttps: true,
            hasCertificate: true,
            certificateTrusted: socket.authorized === true,
            certificateAuthorizationError:
              socket.authorized === true
                ? ""
                : String(socket.authorizationError || "Certificate chain is not trusted"),
            certificateValid,
            isExpired,
            daysUntilExpiry: calculateDaysUntilExpiry(validToDate),
            hostnameMatchesCertificate: determineHostnameMatchesCertificate(
              hostname,
              certificate,
            ),
            validFrom: certificate.valid_from || "",
            validTo: certificate.valid_to || "",
            issuer: formatDistinguishedName(certificate.issuer),
            subject: formatDistinguishedName(certificate.subject),
            subjectAltName,
            fingerprint: certificate.fingerprint256 || certificate.fingerprint || "",
            serialNumber: certificate.serialNumber || "",
          });
        } catch (error) {
          finish(
            buildFailureResult({
              hasHttps: true,
              error: error.message || "Failed to read the SSL certificate",
              errorCode: error.code || "",
            }),
          );
        }
      },
    );

    socket.on("error", (error) => {
      finish(
        buildFailureResult({
          hasHttps: true,
          error: error.message || "Failed to connect to the server for SSL validation",
          errorCode: error.code || "",
        }),
      );
    });

    const timeoutId = setTimeout(() => {
      finish(
        buildFailureResult({
          hasHttps: true,
          error: "SSL validation timed out while connecting to the server",
          errorCode: "ETIMEDOUT",
        }),
      );
    }, timeoutMs);
  });
}

module.exports = { getSslCertificateDetails };
