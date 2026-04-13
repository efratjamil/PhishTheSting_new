const { scanLink } = require("../services/linkService");

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

module.exports = { postScanLink };
