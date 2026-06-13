const { scanLink } = require("../services/linkService");
const { checkUrlSafety } = require("../services/googleSafeBrowsing");
const {
  checkUrlWithLayers,
  isManualAnalysisUnsafe,
} = require("../src/utils/urlAnalyzer");
const { getSslCertificateDetails } = require("../src/services/sslCertificateService");

async function postScanLink(req, res, next) {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ ok: false, error: "url is required" });

    const result = await scanLink(url, { save: true });
    return res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function postCheckUrlSafety(req, res, next) {
  try {
    console.log("POST /api/links/check-safety body:", req.body);

    const { url, messageText = "", extractedUrls = [] } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: "url is required" });
    }

    console.log("/api/links/check-safety before manual analysis:", { url });

    const result = await checkUrlWithLayers(url, async (urlsToCheck) => {
      console.log("/api/links/check-safety before Google Safe Browsing:", urlsToCheck);

      const uniqueUrls = [...new Set(urlsToCheck.filter(Boolean))];
      try {
        const verdicts = await Promise.all(uniqueUrls.map((item) => checkUrlSafety(item)));
        const unsafeVerdicts = verdicts.filter((item) => item.safe === false);

        return {
          safe: unsafeVerdicts.length === 0,
          threats: [...new Set(unsafeVerdicts.flatMap((item) => item.threats || []))],
          checks: verdicts,
          unavailable: false,
        };
      } catch (error) {
        console.warn("/api/links/check-safety Google Safe Browsing unavailable:", {
          message: error.message,
          statusCode: error.statusCode || null,
        });

        return {
          safe: null,
          threats: [],
          checks: [],
          unavailable: true,
          error: error.message || "Google Safe Browsing unavailable",
        };
      }
    }, {
      messageText,
      extractedUrls: Array.isArray(extractedUrls) ? extractedUrls : [],
    });

    console.log("/api/links/check-safety after manual analysis:", {
      originalManualAnalysis: result.originalManualAnalysis,
      expandedUrl: result.expandedUrl,
      expandedManualAnalysis: result.expandedManualAnalysis,
      manualAnalysis: result.manualAnalysis,
      sslCertificate: result.sslCertificate,
    });

    const manualRiskLevel = result.manualAnalysis?.riskLevel || "low";
    const manualUnsafe = isManualAnalysisUnsafe(
      result.manualAnalysis,
      result.sslCertificate,
    );
    const manualThreatTag =
      manualRiskLevel === "high" || manualUnsafe
        ? ["MANUAL_HIGH_RISK"]
        : manualRiskLevel === "medium"
          ? ["MANUAL_MEDIUM_RISK"]
          : [];

    const googleUnavailable = Boolean(result.googleVerdict?.unavailable);
    const threats = [
      ...new Set([
        ...(result.googleVerdict?.threats || []),
        ...manualThreatTag,
        ...(googleUnavailable ? ["GOOGLE_SAFE_BROWSING_UNAVAILABLE"] : []),
      ]),
    ];
    const googleFlagged = result.googleVerdict?.safe === false;
    const safe = !manualUnsafe && !googleFlagged;

    console.log("/api/links/check-safety layered result:", {
      originalUrl: result.originalUrl,
      expandedUrl: result.expandedUrl,
      redirectHops: result.redirectHops,
      manualRiskLevel,
      manualUnsafe,
      manualRiskScore: result.manualAnalysis?.riskScore,
      googleSafe: result.googleVerdict?.safe,
      googleUnavailable,
      threats,
      safe,
    });

    console.log("/api/links/check-safety before res.json:", {
      safe,
      threats,
      expandedUrl: result.expandedUrl,
    });

    return res.json({
      safe,
      threats,
      originalUrl: result.originalUrl,
      expandedUrl: result.expandedUrl,
      redirectHops: result.redirectHops,
      originalManualAnalysis: result.originalManualAnalysis,
      expandedManualAnalysis: result.expandedManualAnalysis,
      manualAnalysis: result.manualAnalysis,
      manualUnsafe,
      originalSslCertificate: result.originalSslCertificate,
      expandedSslCertificate: result.expandedSslCertificate,
      sslCertificate: result.sslCertificate,
      googleVerdict: result.googleVerdict,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      ok: false,
      error: err.message || "Safe Browsing check failed",
      details: err.details || null,
    });
  }
}

async function postGetSslCertificate(req, res, next) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: "url is required" });
    }

    const certificate = await getSslCertificateDetails(url);

    return res.json({
      ok: true,
      url,
      certificate,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || "SSL certificate lookup failed",
    });
  }
}

module.exports = { postScanLink, postCheckUrlSafety, postGetSslCertificate };
