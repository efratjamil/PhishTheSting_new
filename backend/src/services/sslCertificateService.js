const tls = require("node:tls");
const { URL } = require("node:url");

const DEFAULT_TLS_PORT = 443;
const DEFAULT_TIMEOUT_MS = 5000;

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

function buildFailureResult({ hasHttps, error }) {
  return {
    hasHttps,
    hasCertificate: false,
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
  };
}

function buildNoHttpsResult() {
  return buildFailureResult({
    hasHttps: false,
    error: "הקישור לא משתמש ב-HTTPS",
  });
}

async function getSslCertificateDetails(inputUrl, options = {}) {
  let parsedUrl;

  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    return buildFailureResult({
      hasHttps: false,
      error: "הקישור אינו תקין",
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
        host: hostname,
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
                error: "לא נמצאה תעודת SSL",
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
              error: error.message || "לא ניתן היה לקרוא את תעודת ה-SSL",
            }),
          );
        }
      },
    );

    socket.on("error", (error) => {
      finish(
        buildFailureResult({
          hasHttps: true,
          error: error.message || "שגיאה בהתחברות לשרת לצורך קריאת תעודת SSL",
        }),
      );
    });

    const timeoutId = setTimeout(() => {
      finish(
        buildFailureResult({
          hasHttps: true,
          error: "הבדיקה נכשלה בגלל timeout בעת חיבור לתעודת SSL",
        }),
      );
    }, timeoutMs);
  });
}

module.exports = { getSslCertificateDetails };
