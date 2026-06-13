// npm i tldts
const { URL } = require("node:url");
const { isIP } = require("node:net");
const punycode = require("node:punycode");
const axios = require("axios");
const { parse: parseDomain } = require("tldts");
const {
  BRAND_CONFIG,
  analyzeUrlBrandSignals,
} = require("../brand/brandDetector");
const {
  resolveBrandImpersonationWithGemini,
} = require("../../services/geminiService");
const {
  getSslCertificateDetails,
} = require("../services/sslCertificateService");

const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "is.gd",
  "tiny.cc",
  "did.li",
  "s.id",
]);

const SUSPICIOUS_WORDS = [
  "login",
  "signin",
  "sign-in",
  "verify",
  "verification",
  "secure",
  "update",
  "account",
  "password",
  "reset",
  "wallet",
  "bank",
  "billing",
  "invoice",
  "gift",
  "crypto",
  "support",
  "sso",
];

const REDIRECT_PARAMS = new Set([
  "url",
  "u",
  "to",
  "target",
  "dest",
  "destination",
  "redirect",
  "redirect_url",
  "redirect_uri",
  "continue",
  "return",
  "return_to",
  "next",
  "callback",
]);

const DNS_FAILURE_CODES = new Set(["ENOTFOUND", "EAI_AGAIN"]);
const CONNECTIVITY_FAILURE_CODES = new Set([
  ...DNS_FAILURE_CODES,
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
]);

// חשוב: זה חייב להיות קונפיגורציה שלך, לא רשימת "כל העולם".
// לפרויקט אקדמי/מוצר MVP בחרי סט מותגים רלוונטי.
function normalizeHost(hostname) {
  return hostname.toLowerCase().replace(/\.$/, "");
}

function isKnownShortenerUrl(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    const hostname = normalizeHost(parsed.hostname);
    const domainInfo = parseDomain(hostname, {
      allowIcannDomains: true,
      allowPrivateDomains: true,
    });
    const registrableDomain = (domainInfo.domain || hostname).toLowerCase();

    return SHORTENER_HOSTS.has(registrableDomain);
  } catch {
    return false;
  }
}

function isBitlyUrl(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    return normalizeHost(parsed.hostname) === "bit.ly";
  } catch {
    return false;
  }
}

async function expandBitlyUrl(shortUrl) {
  const token = process.env.BITLY_ACCESS_TOKEN;

  if (!token) {
    console.log("Bitly API failed", {
      shortUrl,
      reason: "BITLY_ACCESS_TOKEN is missing",
    });
    return null;
  }

  try {
    const parsed = new URL(shortUrl);
    const bitlink_id = `${parsed.host}${parsed.pathname}`;

    console.log("Bitly API expansion started", {
      shortUrl,
      bitlink_id,
    });

    const response = await axios.post(
      "https://api-ssl.bitly.com/v4/expand",
      { bitlink_id },
      {
        timeout: 3000,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        proxy: false,
      },
    );

    if (response.data?.long_url) {
      console.log("Bitly API success", {
        shortUrl,
        expandedUrl: response.data.long_url,
      });
      return response.data.long_url;
    }

    console.log("Bitly API failed", {
      shortUrl,
      reason: "long_url missing in response",
      responseData: response.data || null,
    });
    return null;
  } catch (error) {
    console.log("Bitly API failed", {
      shortUrl,
      message: error.message,
      status: error.response?.status || null,
      responseData: error.response?.data || null,
    });
    return null;
  }
}

function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function shannonEntropy(text) {
  if (!text) return 0;
  const counts = new Map();
  for (const ch of text) counts.set(ch, (counts.get(ch) || 0) + 1);

  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / text.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function tokenize(value) {
  return safeDecode(value)
    .toLowerCase()
    .normalize("NFKC")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function skeleton(token) {
  return punycode
    .toUnicode(token)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[0]/g, "o")
    .replace(/[1|!]/g, "l")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9]/g, "");
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
}

function defaultPort(protocol) {
  return protocol === "http:" ? "80" : protocol === "https:" ? "443" : "";
}

function labelHasMixedScripts(label) {
  const scripts = new Set();

  for (const ch of label.normalize("NFKC")) {
    if (/\p{Script=Latin}/u.test(ch)) scripts.add("Latin");
    else if (/\p{Script=Cyrillic}/u.test(ch)) scripts.add("Cyrillic");
    else if (/\p{Script=Greek}/u.test(ch)) scripts.add("Greek");
    else if (/\p{Script=Hebrew}/u.test(ch)) scripts.add("Hebrew");
    else if (/\p{Script=Arabic}/u.test(ch)) scripts.add("Arabic");
  }

  return scripts.size > 1 && scripts.has("Latin");
}

function getBrandAliases(rule = {}) {
  return [...new Set([rule.displayName, ...(rule.aliases || [])])]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

function getOfficialDomains(rule = {}) {
  return new Set(
    (rule.officialDomains || []).map((domain) =>
      String(domain || "").toLowerCase(),
    ),
  );
}

function detectBrandRisk(hostname, registrableDomain, brandConfig) {
  const findings = [];
  let score = 0;

  const hostTokens = tokenize(hostname.replace(/\./g, "-"));
  const registrableLabel = (
    registrableDomain.split(".")[0] || ""
  ).toLowerCase();

  for (const rule of brandConfig) {
    const brand = rule.brand.toLowerCase();
    const legit = new Set(rule.legitDomains.map((d) => d.toLowerCase()));
    const brandSkel = skeleton(brand);

    const hasBrandToken = hostTokens.some((t) => skeleton(t) === brandSkel);
    const rootSkeleton = skeleton(registrableLabel);

    const skeletonMatchOnRoot =
      rootSkeleton === brandSkel && registrableLabel !== brand;

    const nearMatchOnRoot =
      rootSkeleton &&
      rootSkeleton !== brandSkel &&
      levenshtein(rootSkeleton, brandSkel) === 1;

    const allowed = legit.has(registrableDomain);

    if (!allowed && hasBrandToken) {
      findings.push(
        `שם המותג "${brand}" מופיע ב-hostname, אבל הדומיין הרשום הוא "${registrableDomain}" ואינו דומיין מורשה של המותג`,
      );
      score += 25;
      continue;
    }

    if (!allowed && (skeletonMatchOnRoot || nearMatchOnRoot)) {
      findings.push(
        `הדומיין הרשום "${registrableDomain}" דומה מאוד למותג "${brand}" אך אינו דומיין מורשה`,
      );
      score += 30;
    }
  }

  return { findings, score };
}

function detectPathLookalikeRisk(parsedUrl, registrableDomain, brandConfig) {
  const findings = [];
  let score = 0;
  const pathTokens = tokenize(parsedUrl.pathname);
  const tokenCandidates = [...pathTokens];

  for (let index = 0; index < pathTokens.length - 1; index += 1) {
    tokenCandidates.push(`${pathTokens[index]}${pathTokens[index + 1]}`);
  }

  for (const token of tokenCandidates) {
    const tokenSkeleton = skeleton(token);
    const tokenVisualSkeleton = tokenSkeleton.replace(/i/g, "l");
    if (!tokenVisualSkeleton || tokenVisualSkeleton.length < 3) continue;

    if (
      token.length >= 3 &&
      token.length <= 12 &&
      tokenVisualSkeleton !== token &&
      /[0-9il$]/i.test(token)
    ) {
      findings.push(
        `הטוקן "${token}" בנתיב משתמש בתווים מבלבלים ועלול להסתיר יעד אחר`,
      );
      score += 18;
      continue;
    }

    for (const rule of brandConfig) {
      const brand = rule.brand.toLowerCase();
      const legit = new Set(rule.legitDomains.map((d) => d.toLowerCase()));
      const brandSkeleton = skeleton(brand);

      if (tokenVisualSkeleton !== brandSkeleton) continue;
      if (token.toLowerCase() === brand) continue;
      if (legit.has(registrableDomain)) continue;

      findings.push(
        `הטוקן "${token}" בנתיב נראה כמו המותג "${brand}" אך נכתב בצורה מבלבלת`,
      );
      score += 24;
      break;
    }
  }

  return { findings, score };
}

function detectPathBrandLookalikeRisk(parsedUrl, registrableDomain, brandConfig) {
  const findings = [];
  let score = 0;
  const pathTokens = tokenize(parsedUrl.pathname);
  const tokenCandidates = [...pathTokens];

  for (let index = 0; index < pathTokens.length - 1; index += 1) {
    tokenCandidates.push(`${pathTokens[index]}${pathTokens[index + 1]}`);
  }

  for (const token of tokenCandidates) {
    const tokenVisualSkeleton = skeleton(token).replace(/i/g, "l");
    if (!tokenVisualSkeleton || tokenVisualSkeleton.length < 3) continue;

    for (const rule of brandConfig) {
      if (getOfficialDomains(rule).has(registrableDomain)) continue;

      let matchedBrand = false;

      for (const alias of getBrandAliases(rule)) {
        const normalizedAlias = alias.toLowerCase();
        const aliasVisualSkeleton = skeleton(alias).replace(/i/g, "l");

        if (tokenVisualSkeleton !== aliasVisualSkeleton) continue;
        if (token.toLowerCase() === normalizedAlias) continue;

        findings.push(
          `׳”׳˜׳•׳§׳ "${token}" ׳‘׳ ׳×׳™׳‘ ׳ ׳¨׳׳” ׳›׳׳• ׳”׳׳•׳×׳’ "${rule.displayName}" ׳׳ ׳ ׳›׳×׳‘ ׳‘׳¦׳•׳¨׳” ׳׳‘׳׳‘׳׳×`,
        );
        score += 24;
        matchedBrand = true;
        break;
      }

      if (matchedBrand) {
        break;
      }
    }
  }

  return { findings, score };
}

function getSslErrorCode(sslCertificate = {}) {
  if (!sslCertificate || typeof sslCertificate !== "object") {
    return "";
  }

  return String(sslCertificate.errorCode || "").toUpperCase();
}

function hasDnsResolutionFailure(sslCertificate = {}) {
  return DNS_FAILURE_CODES.has(getSslErrorCode(sslCertificate));
}

function hasConnectivityFailure(sslCertificate = {}) {
  return CONNECTIVITY_FAILURE_CODES.has(getSslErrorCode(sslCertificate));
}

function hasCriticalSslIssue(sslCertificate = {}) {
  if (!sslCertificate || typeof sslCertificate !== "object") {
    return false;
  }

  if (sslCertificate.hasHttps === false) return true;
  if (sslCertificate.hasCertificate === false) return true;
  if (sslCertificate.certificateValid === false || sslCertificate.isExpired === true) {
    return true;
  }
  if (sslCertificate.hostnameMatchesCertificate === false) return true;

  return hasConnectivityFailure(sslCertificate);
}

function isManualAnalysisUnsafe(analysis = {}, sslCertificate = null) {
  if (!analysis || typeof analysis !== "object") {
    return false;
  }

  if (analysis.riskLevel && analysis.riskLevel !== "low") {
    return true;
  }

  return hasCriticalSslIssue(sslCertificate);
}

function detectExternalRedirect(parsedUrl) {
  const findings = [];
  let score = 0;

  for (const [key, value] of parsedUrl.searchParams.entries()) {
    const param = key.toLowerCase();
    if (!REDIRECT_PARAMS.has(param)) continue;

    try {
      const target = new URL(value, parsedUrl.origin);
      if (target.origin !== parsedUrl.origin) {
        findings.push(
          `פרמטר ההפניה "${key}" מצביע ל-origin חיצוני: ${target.origin}`,
        );
        score += 25;
      }
    } catch {
      // אם זה לא URL תקין, פשוט מדלגים
    }
  }

  return { findings, score };
}

function makeResult(base) {
  const score = Math.max(0, Math.min(base.riskScore, 100));
  const riskLevel = score >= 60 ? "high" : score >= 30 ? "medium" : "low";

  return {
    ...base,
    riskScore: score,
    riskLevel,
  };
}

function applySslSignals(analysis, sslCertificate) {
  if (!analysis || !sslCertificate) {
    return {
      analysis,
      sslCertificate: sslCertificate || null,
      sslFindings: [],
    };
  }

  const nextFindings = [...(analysis.findings || [])];
  let nextScore = analysis.riskScore || 0;
  const sslFindings = [];

  const addSslFinding = (points, message) => {
    nextScore += points;
    nextFindings.push(message);
    sslFindings.push(message);
  };

  if (sslCertificate.hasHttps === false) {
    addSslFinding(10, "הקישור לא משתמש ב-HTTPS");
  } else if (sslCertificate.hasHttps === true && sslCertificate.hasCertificate === false) {
    addSslFinding(15, "לא נמצאה תעודת SSL תקינה לקישור");
  }

  if (
    sslCertificate.hasCertificate === true &&
    (sslCertificate.certificateValid === false || sslCertificate.isExpired === true)
  ) {
    addSslFinding(15, "תעודת ה-SSL אינה בתוקף או שפג תוקפה");
  }

  if (
    sslCertificate.hasCertificate === true &&
    sslCertificate.hostnameMatchesCertificate === false
  ) {
    addSslFinding(35, "שם הדומיין לא תואם לתעודת ה-SSL");
  }

  if (sslCertificate.hasHttps === false) {
    nextScore += 20;
  } else if (sslCertificate.hasHttps === true && sslCertificate.hasCertificate === false) {
    nextScore += 10;
  }

  if (
    sslCertificate.hasCertificate === true &&
    (sslCertificate.certificateValid === false || sslCertificate.isExpired === true)
  ) {
    nextScore += 15;
  }

  if (
    sslCertificate.hasCertificate === true &&
    sslCertificate.hostnameMatchesCertificate === false
  ) {
    nextScore += 10;
  }

  const updatedAnalysis = makeResult({
    ...analysis,
    riskScore: nextScore,
    findings: [...new Set(nextFindings)],
  });

  updatedAnalysis.sslCertificate = sslCertificate;
  updatedAnalysis.sslFindings = sslFindings;

  return {
    analysis: updatedAnalysis,
    sslCertificate,
    sslFindings,
  };
}

function applyReachabilitySignals(analysis, sslCertificate) {
  if (!analysis || !sslCertificate) {
    return analysis;
  }

  const nextFindings = [...(analysis.findings || [])];
  let nextScore = analysis.riskScore || 0;

  const addFinding = (points, message) => {
    nextScore += points;
    nextFindings.push(message);
  };

  if (sslCertificate.hasHttps === false) {
    nextScore = Math.max(nextScore, 30);
  } else if (sslCertificate.hasHttps === true && sslCertificate.hasCertificate === false) {
    if (hasDnsResolutionFailure(sslCertificate)) {
      addFinding(20, "הדומיין לא נמצא או שלא ניתן לאמת את הקישור");
    } else if (hasConnectivityFailure(sslCertificate)) {
      addFinding(15, "לא ניתן להגיע לשרת או לאמת את הקישור");
    } else {
      addFinding(5, "לא נמצאה תעודת SSL תקינה לקישור");
    }
  }

  if (
    sslCertificate.hasCertificate === true &&
    (sslCertificate.certificateValid === false || sslCertificate.isExpired === true)
  ) {
    addFinding(15, "תעודת ה-SSL אינה בתוקף או שפג תוקפה");
  }

  return makeResult({
    ...analysis,
    riskScore: nextScore,
    findings: [...new Set(nextFindings)],
    sslCertificate,
  });
}

function analyzeUrl(rawUrl, brandConfig = BRAND_CONFIG) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return makeResult({
      input: rawUrl,
      normalizedUrl: null,
      registrableDomain: null,
      publicSuffix: null,
      subdomain: null,
      hostname: null,
      unicodeHostname: null,
      riskScore: 20,
      findings: ["כתובת URL לא תקינה או לא מלאה"],
    });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return makeResult({
      input: rawUrl,
      normalizedUrl: parsed.toString(),
      registrableDomain: null,
      publicSuffix: null,
      subdomain: null,
      hostname: parsed.hostname || null,
      unicodeHostname: parsed.hostname
        ? punycode.toUnicode(parsed.hostname)
        : null,
      riskScore: 80,
      findings: [`סכמה לא נתמכת או מסוכנת: ${parsed.protocol}`],
    });
  }

  const hostname = normalizeHost(parsed.hostname);
  const unicodeHostname = punycode.toUnicode(hostname);

  const domainInfo = parseDomain(hostname, {
    allowIcannDomains: true,
    allowPrivateDomains: true,
  });

  const registrableDomain = (domainInfo.domain || hostname).toLowerCase();
  const publicSuffix = domainInfo.publicSuffix || null;
  const subdomain = domainInfo.subdomain || "";

  const findings = [];
  let score = 0;

  const add = (points, message) => {
    score += points;
    findings.push(message);
  };

  // 1. credentials לפני ה-host
  if (parsed.username || parsed.password) {
    add(35, "הקישור מכיל username/password לפני שם המארח");
  }

  // 2. כתובת IP במקום דומיין
  const ipCandidate = hostname.replace(/^\[|\]$/g, "");
  if (isIP(ipCandidate)) {
    add(35, "הקישור משתמש בכתובת IP במקום בשם דומיין");
  }

  const isShortener = SHORTENER_HOSTS.has(registrableDomain);

  // 3. shortener
  if (isShortener) {
    add(12, "הקישור מגיע משירות קיצור ולכן היעד האמיתי מוסתר בשלב הראשון");
  }

  // 4. IDN / Punycode
  if (hostname.includes("xn--")) {
    add(25, "שם המתחם מכיל Punycode, ולכן נדרש לבדוק הומוגרפים ו-IDN");
  }

  // 5. ערבוב סקריפטים בתוך אותה תווית
  if (unicodeHostname.split(".").some(labelHasMixedScripts)) {
    add(25, "נמצא ערבוב סקריפטים בתוך תווית אחת של הדומיין");
  }

  // 6. ריבוי תתי־דומיינים
  const subCount = subdomain ? subdomain.split(".").filter(Boolean).length : 0;
  if (subCount >= 3) {
    add(18, "מספר חריג של תתי־דומיינים");
  }

  // 7. אורך URL
  if (rawUrl.length >= 100) {
    add(10, "הקישור ארוך במיוחד");
  }

  // 8. אנטרופיה גבוהה ב-hostname
  const hostEntropy = shannonEntropy(hostname.replace(/\./g, ""));
  if (hostEntropy >= 3.8) {
    add(15, "שם המארח נראה אקראי יחסית");
  }

  // 9. יחס ספרות/אותיות
  const letters = (hostname.match(/[a-z]/gi) || []).length;
  const digits = (hostname.match(/\d/g) || []).length;
  if (letters > 0 && digits / letters >= 0.3) {
    add(10, "יחס גבוה של ספרות לאותיות בשם המתחם");
  }

  // 10. מקפים רבים בדומיין הרשום
  if ((registrableDomain.match(/-/g) || []).length >= 2) {
    add(12, "ריבוי מקפים בדומיין הרשום");
  }

  // 11. מילים חשודות ב-path / query
  const decodedPathAndQuery = safeDecode(
    `${parsed.pathname}${parsed.search}`,
  ).toLowerCase();
  const foundWords = [
    ...new Set(SUSPICIOUS_WORDS.filter((w) => decodedPathAndQuery.includes(w))),
  ];
  if (foundWords.length > 0) {
    add(
      Math.min(20, 6 + foundWords.length * 4),
      `נמצאו מילות פיתוי/אימות בנתיב או בשאילתה: ${foundWords.join(", ")}`,
    );
  }

  // 12. URL נוסף בתוך path/query או // חריג
  if (
    /https?:\/\//i.test(decodedPathAndQuery) ||
    parsed.pathname.includes("//")
  ) {
    add(15, "הנתיב או הפרמטרים מכילים URL נוסף או // חריג");
  }

  // 13. percent-encoding משמעותי
  const percentEncodedCount = (parsed.search.match(/%[0-9a-f]{2}/gi) || [])
    .length;
  if (percentEncodedCount >= 4 || /%25[0-9a-f]{2}/i.test(parsed.search)) {
    add(10, "יש שימוש משמעותי בקידוד אחוזים");
  }

  // 14. מחרוזת שנראית כמו דומיין נוסף בתוך הנתיב/שאילתה
  if (
    /\b[a-z0-9-]+\.(?:com|net|org|co|io|gov|app|bank|edu)\b/i.test(
      decodedPathAndQuery,
    )
  ) {
    add(8, "הנתיב או הפרמטרים מכילים מחרוזת שנראית כמו דומיין נוסף");
  }

  // 15. פורט לא רגיל
  if (parsed.port && parsed.port !== defaultPort(parsed.protocol)) {
    add(10, `נעשה שימוש בפורט לא רגיל: ${parsed.port}`);
  }

  // 16. התחזות למותג
  const brandSignals = analyzeUrlBrandSignals({
    hostname,
    registrableDomain,
    subdomain,
    pathname: parsed.pathname,
    brandConfig,
  });
  score += brandSignals.scoreDelta;
  findings.push(...brandSignals.findings);

  // 17. פרמטרי redirect החוצה
  const pathLookalikeRisk = detectPathBrandLookalikeRisk(
    parsed,
    registrableDomain,
    brandConfig,
  );
  score += pathLookalikeRisk.score;
  findings.push(...pathLookalikeRisk.findings);

  const redirectRisk = detectExternalRedirect(parsed);
  score += redirectRisk.score;
  findings.push(...redirectRisk.findings);

  if (isShortener && brandSignals.lookalikeMatchCount > 0) {
    add(
      22,
      "שילוב של שירות קיצור עם טוקן מטעה בנתיב מעלה משמעותית את הסבירות לפישינג",
    );
  }

  if (isShortener && brandSignals.lookalikeMatchCount > 0 && foundWords.length > 0) {
    add(
      10,
      `שירות קיצור, טוקן מטעה ומילות פיתוי יחד (${foundWords.join(", ")}) מחזקים את החשד`,
    );
  }

  return makeResult({
    input: rawUrl,
    normalizedUrl: parsed.toString(),
    registrableDomain,
    publicSuffix,
    subdomain,
    hostname,
    unicodeHostname,
    riskScore: score,
    findings,
    brandDetections: brandSignals.detections,
    ambiguousBrandMatches: brandSignals.ambiguousMatches,
    unmatchedBrandCandidates: brandSignals.unmatchedBrandLikeCandidates,
  });
}

// הרחבה server-side של shorteners / redirect chains.
// לא להריץ את זה בדפדפן של המשתמש.
async function expandShortUrl(inputUrl, fetchImpl = fetch, maxHops = 5) {
  if (!isKnownShortenerUrl(inputUrl)) {
    return {
      originalUrl: inputUrl,
      finalUrl: inputUrl,
      hops: [],
    };
  }

  let current = inputUrl;
  const hops = [];

  for (let i = 0; i < maxHops; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    let response;

    try {
      response = await fetchImpl(current, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
      });

      // יש אתרים שלא תומכים ב-HEAD
      if (response.status === 405 || response.status === 501) {
        response = await fetchImpl(current, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
        });
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      break;
    }

    const location = response.headers.get("location");
    if (!location) break;

    const next = new URL(location, current).toString();
    hops.push({
      status: response.status,
      from: current,
      to: next,
    });

    current = next;
  }

  return {
    originalUrl: inputUrl,
    finalUrl: current,
    hops,
  };
}

function detectShortenerInterstitial(expanded = {}) {
  const originalUrl = expanded.originalUrl || "";
  const finalUrl = expanded.finalUrl || "";
  const hops = Array.isArray(expanded.hops) ? expanded.hops : [];

  if (!originalUrl || !finalUrl || hops.length === 0) {
    return null;
  }

  try {
    const originalParsed = new URL(originalUrl);
    const finalParsed = new URL(finalUrl);
    const originalHost = normalizeHost(originalParsed.hostname);
    const finalHost = normalizeHost(finalParsed.hostname);
    const originalDomain = (
      parseDomain(originalHost, {
        allowIcannDomains: true,
        allowPrivateDomains: true,
      }).domain || originalHost
    ).toLowerCase();
    const finalDomain = (
      parseDomain(finalHost, {
        allowIcannDomains: true,
        allowPrivateDomains: true,
      }).domain || finalHost
    ).toLowerCase();

    if (originalDomain !== finalDomain || !SHORTENER_HOSTS.has(originalDomain)) {
      return null;
    }

    const landingPath = safeDecode(`${finalParsed.pathname}${finalParsed.search}`).toLowerCase();
    const looksLikeInterstitial =
      /(nospam|preview|warning|blocked|unsafe|interstitial|captcha|verify|alert)/i.test(
        landingPath,
      );

    if (looksLikeInterstitial) {
      return {
        scoreDelta: 24,
        finding:
          "שירות הקיצור הפנה לדף ביניים/סינון במקום לחשוף יעד חיצוני, ולכן היעד הסופי נותר מוסתר.",
      };
    }

    if (finalHost === originalHost && finalUrl !== originalUrl) {
      return {
        scoreDelta: 14,
        finding:
          "שירות הקיצור לא חשף יעד חיצוני ברור ונשאר בתוך אותו דומיין מקוצר, ולכן היעד עדיין מוסתר.",
      };
    }

    return null;
  } catch {
    return null;
  }
}

function messageHasFinancialPressure(messageText = "") {
  const normalized = String(messageText).toLowerCase();

  return [
    "חוב",
    "לתשלום",
    "תשלום",
    "חשבונית",
    "מכס",
    "fee",
    "payment",
    "invoice",
    "debt",
    "due",
  ].some((term) => normalized.includes(term));
}

function shouldSkipGeminiForKnownShortenerPlatform(analysis = {}, candidateBrand = "") {
  const hostname = normalizeHost(analysis.hostname || "");
  const registrableDomain = (analysis.registrableDomain || hostname || "").toLowerCase();
  const normalizedCandidate = skeleton(candidateBrand);

  if (!SHORTENER_HOSTS.has(registrableDomain)) {
    return false;
  }

  const platformTokens = new Set(
    tokenize(hostname.replace(/\./g, "-")).map((token) => skeleton(token)),
  );
  platformTokens.add(skeleton(registrableDomain.split(".")[0] || ""));

  return platformTokens.has(normalizedCandidate);
}

// אינטגרציה עם השכבה שכבר יש לך
function shouldUseGeminiBrandFallback({
  analysis,
  hasUrl = false,
} = {}) {
  if (!analysis || !hasUrl) {
    return false;
  }

  const ambiguousMatches = Array.isArray(analysis.ambiguousBrandMatches)
    ? analysis.ambiguousBrandMatches
    : [];
  const unmatchedCandidates = Array.isArray(analysis.unmatchedBrandCandidates)
    ? analysis.unmatchedBrandCandidates
    : [];
  const strongDetections = Array.isArray(analysis.brandDetections)
    ? analysis.brandDetections.filter((item) => item.confidence >= 90)
    : [];

  if (strongDetections.length > 0 && analysis.riskScore >= 40) {
    return false;
  }

  return (
    ambiguousMatches.length > 0 ||
    (analysis.riskScore >= 30 && unmatchedCandidates.length > 0)
  );
}

function pickGeminiCandidate(analysis = {}) {
  const ambiguousMatch = Array.isArray(analysis.ambiguousBrandMatches)
    ? analysis.ambiguousBrandMatches[0]
    : null;

  if (ambiguousMatch?.rawValue) {
    return ambiguousMatch.rawValue;
  }

  const unmatchedCandidate = Array.isArray(analysis.unmatchedBrandCandidates)
    ? analysis.unmatchedBrandCandidates[0]
    : null;

  return unmatchedCandidate?.rawValue || "";
}

async function applyGeminiBrandFallback(analysis, context = {}) {
  if (!shouldUseGeminiBrandFallback({ analysis, hasUrl: Boolean(context.url) })) {
    return analysis;
  }

  const candidateBrand = pickGeminiCandidate(analysis);
  if (!candidateBrand) {
    return analysis;
  }

  if (shouldSkipGeminiForKnownShortenerPlatform(analysis, candidateBrand)) {
    return analysis;
  }

  const geminiAssessment = await resolveBrandImpersonationWithGemini({
    candidateBrand,
    fullDomain: analysis.hostname || analysis.registrableDomain || context.url || "",
    messageText: context.messageText || "",
    extractedUrls: context.extractedUrls || [context.url].filter(Boolean),
  });

  if (!geminiAssessment) {
    return analysis;
  }

  const nextFindings = [...analysis.findings];
  let nextScore = analysis.riskScore;

  if (
    geminiAssessment.isBrand &&
    geminiAssessment.isLikelyImpersonation &&
    geminiAssessment.confidence >= 75
  ) {
    nextScore += geminiAssessment.confidence >= 90 ? 22 : 15;
    nextFindings.push(
      `זוהתה התחזות אפשרית למותג ${geminiAssessment.realBrandName || candidateBrand}. ${geminiAssessment.reason || ""}`.trim(),
    );
  } else if (
    geminiAssessment.isBrand &&
    geminiAssessment.isLikelyImpersonation &&
    geminiAssessment.confidence >= 50
  ) {
    nextScore += 8;
    nextFindings.push(
      `נמצא חשד בינוני לקשר למותג ${geminiAssessment.realBrandName || candidateBrand}, אך הזיהוי אינו חד-משמעי.`,
    );
  }

  const updated = makeResult({
    ...analysis,
    findings: [...new Set(nextFindings)],
    riskScore: nextScore,
  });

  updated.geminiBrandAssessment = geminiAssessment;
  return updated;
}

async function checkUrlWithLayers(inputUrl, checkGoogleSafeBrowsing, context = {}) {
  let expanded;

  try {
    expanded = await expandShortUrl(inputUrl);
  } catch {
    expanded = {
      originalUrl: inputUrl,
      finalUrl: inputUrl,
      hops: [],
    };
  }

  if (isBitlyUrl(inputUrl) && expanded.finalUrl === inputUrl) {
    const bitlyExpandedUrl = await expandBitlyUrl(inputUrl);

    if (bitlyExpandedUrl) {
      expanded = {
        originalUrl: inputUrl,
        finalUrl: bitlyExpandedUrl,
        hops: [],
      };
    } else {
      expanded = {
        ...expanded,
        expansionFinding: "הקישור מקוצר אך לא ניתן היה לחשוף את היעד הסופי",
      };
    }
  }

  let originalManual = analyzeUrl(inputUrl);
  let expandedManual =
    expanded.finalUrl === inputUrl ? originalManual : analyzeUrl(expanded.finalUrl);

  if (expanded.expansionFinding) {
    expandedManual.findings = [...expandedManual.findings, expanded.expansionFinding];
  }

  const shortenerInterstitial = detectShortenerInterstitial(expanded);
  if (shortenerInterstitial) {
    expandedManual = makeResult({
      ...expandedManual,
      riskScore: expandedManual.riskScore + shortenerInterstitial.scoreDelta,
      findings: [...expandedManual.findings, shortenerInterstitial.finding],
    });
  }

  if (shortenerInterstitial && messageHasFinancialPressure(context.messageText || "")) {
    expandedManual = makeResult({
      ...expandedManual,
      riskScore: expandedManual.riskScore + 14,
      findings: [
        ...expandedManual.findings,
        "בשילוב עם שפה של חוב/תשלום בהודעה, קישור מקוצר שמסתיר יעד מאחורי דף ביניים נחשב חשוד במיוחד.",
      ],
    });
  }

  const [originalSslCertificate, expandedSslCertificateRaw] = await Promise.all([
    getSslCertificateDetails(inputUrl),
    expanded.finalUrl === inputUrl
      ? Promise.resolve(null)
      : getSslCertificateDetails(expanded.finalUrl),
  ]);

  originalManual = await applyGeminiBrandFallback(originalManual, {
    ...context,
    url: inputUrl,
  });

  if (expanded.finalUrl === inputUrl) {
    expandedManual = originalManual;
  } else {
    expandedManual = await applyGeminiBrandFallback(expandedManual, {
      ...context,
      url: expanded.finalUrl,
    });
  }

  const originalSslApplied = applySslSignals(originalManual, originalSslCertificate);
  originalManual = originalSslApplied.analysis;
  originalManual = applyReachabilitySignals(originalManual, originalSslCertificate);

  const expandedSslCertificate =
    expanded.finalUrl === inputUrl
      ? originalSslCertificate
      : expandedSslCertificateRaw;

  if (expanded.finalUrl === inputUrl) {
    expandedManual = originalManual;
  } else {
    const expandedSslApplied = applySslSignals(expandedManual, expandedSslCertificate);
    expandedManual = expandedSslApplied.analysis;
    expandedManual = applyReachabilitySignals(expandedManual, expandedSslCertificate);
  }

  const manual =
    expandedManual.riskScore >= originalManual.riskScore
      ? expandedManual
      : originalManual;

  const googleVerdict = await checkGoogleSafeBrowsing([
    inputUrl,
    expanded.finalUrl,
  ]);

  return {
    originalUrl: inputUrl,
    expandedUrl: expanded.finalUrl,
    redirectHops: expanded.hops,
    originalManualAnalysis: originalManual,
    expandedManualAnalysis: expandedManual,
    manualAnalysis: manual,
    originalSslCertificate,
    expandedSslCertificate,
    sslCertificate:
      expandedManual.riskScore >= originalManual.riskScore
        ? expandedSslCertificate
        : originalSslCertificate,
    googleVerdict,
  };
}

module.exports = {
  analyzeUrl,
  expandShortUrl,
  checkUrlWithLayers,
  hasCriticalSslIssue,
  isManualAnalysisUnsafe,
};
