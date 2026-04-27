const { scanLink } = require("../services/linkService");
const { checkUrlSafety } = require("../services/googleSafeBrowsing");

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

    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: "url is required" });
    }

    const result = await checkUrlSafety(url);
    return res.json({ safe: result.safe, threats: result.threats || [] });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      ok: false,
      error: err.message || "Safe Browsing check failed",
      details: err.details || null,
    });
  }
}

module.exports = { postScanLink, postCheckUrlSafety };
