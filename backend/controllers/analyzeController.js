const { analyzeMessage, generateSummary } = require("../utils/analyzeTextContent");
const SearchHistory = require("../models/SearchHistory");

function flattenAnalysis(analysis = {}) {
  return Object.values(analysis).flat();
}

exports.analyzeMessage = (req, res) => {
  console.log("New search started");

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "נדרש שדה הודעה (message) תקף." });
  }

  const analysis = analyzeMessage(message);
  const summary = generateSummary(analysis);

  return res.json({ analysis, summary });
};

exports.saveAnalysisHistory = async (req, res) => {
  try {
    const {
      message,
      summary,
      analysis,
      textAnalysis,
      safe,
      status,
      matchedWords,
      extractedUrls,
      urlAnalysis,
      checkedLinks,
      urlThreats,
    } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required." });
    }

    const safeAnalysis =
      analysis && typeof analysis === "object" && !Array.isArray(analysis)
        ? analysis
        : {};

    const entry = await SearchHistory.create({
      userId: req.user.userId,
      message,
      summary: typeof summary === "string" ? summary : "",
      analysis: safeAnalysis,
      textAnalysis: Boolean(textAnalysis),
      safe:
        typeof safe === "boolean"
          ? safe
          : !(Boolean(textAnalysis) || Boolean(urlAnalysis)),
      status:
        typeof status === "string"
          ? status
          : Boolean(textAnalysis) || Boolean(urlAnalysis)
            ? "suspicious"
            : "safe",
      matchedWords: Array.isArray(matchedWords)
        ? matchedWords
        : flattenAnalysis(safeAnalysis),
      extractedUrls: Array.isArray(extractedUrls) ? extractedUrls : [],
      urlAnalysis: Boolean(urlAnalysis),
      checkedLinks: Array.isArray(checkedLinks) ? checkedLinks : [],
      urlThreats: Array.isArray(urlThreats) ? urlThreats : [],
    });

    return res.status(201).json({ ok: true, id: entry._id });
  } catch (err) {
    console.error("saveAnalysisHistory error:", err);
    return res
      .status(500)
      .json({ error: "Failed to save history.", details: err.message });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const items = await SearchHistory.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, items });
  } catch (err) {
    console.error("getUserHistory error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch history.", details: err.message });
  }
};

exports.deleteHistoryItem = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const deleted = await SearchHistory.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "History item not found." });
    }

    return res.json({ ok: true, id });
  } catch (err) {
    console.error("deleteHistoryItem error:", err);
    return res
      .status(500)
      .json({ error: "Failed to delete history item.", details: err.message });
  }
};

exports.getUserDashboardStats = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const items = await SearchHistory.find({ userId: req.user.userId })
      .select("status safe textAnalysis urlAnalysis checkedLinks")
      .lean();

    const stats = items.reduce(
      (accumulator, item) => {
        const isSuspicious = Boolean(
          item.status === "suspicious" ||
            item.safe === false ||
            item.textAnalysis ||
            item.urlAnalysis,
        );

        accumulator.totalScans += 1;
        accumulator.totalCheckedLinks += Array.isArray(item.checkedLinks)
          ? item.checkedLinks.length
          : 0;

        if (isSuspicious) {
          accumulator.suspiciousScans += 1;
        } else {
          accumulator.safeScans += 1;
        }

        return accumulator;
      },
      {
        totalScans: 0,
        suspiciousScans: 0,
        safeScans: 0,
        totalCheckedLinks: 0,
      },
    );

    return res.json({
      ok: true,
      stats: {
        totalScans: stats.totalScans,
        suspiciousScans: stats.suspiciousScans,
        safeScans: stats.safeScans,
        totalCheckedLinks: stats.totalCheckedLinks,
      },
    });
  } catch (err) {
    console.error("getUserDashboardStats error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch dashboard stats.", details: err.message });
  }
};
