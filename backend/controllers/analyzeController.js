const { analyzeMessage, generateSummary } = require("../utils/analyzeTextContent");
const SearchHistory = require("../models/SearchHistory");

function flattenAnalysis(analysis = {}) {
  return Object.values(analysis).flat();
}

exports.analyzeMessage = (req, res) => {
  console.log("POST /api/analyze body:", req.body);

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "נדרש שדה הודעה (message) תקף." });
  }

  const analysis = analyzeMessage(message);
  const summary = generateSummary(analysis);

  console.log("/api/analyze analysis:", analysis);
  console.log("/api/analyze summary:", summary);

  return res.json({ analysis, summary });
};

exports.saveAnalysisHistory = async (req, res) => {
  try {
    const {
      userId,
      message,
      analysis,
      textAnalysis,
      matchedWords,
      extractedUrls,
      urlAnalysis,
      urlThreats,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required." });
    }

    const safeAnalysis =
      analysis && typeof analysis === "object" && !Array.isArray(analysis)
        ? analysis
        : {};

    const entry = await SearchHistory.create({
      userId,
      message,
      analysis: safeAnalysis,
      textAnalysis: Boolean(textAnalysis),
      matchedWords: Array.isArray(matchedWords)
        ? matchedWords
        : flattenAnalysis(safeAnalysis),
      extractedUrls: Array.isArray(extractedUrls) ? extractedUrls : [],
      urlAnalysis: Boolean(urlAnalysis),
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
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    const items = await SearchHistory.find({ userId }).sort({ createdAt: -1 }).lean();

    return res.json({ ok: true, items });
  } catch (err) {
    console.error("getUserHistory error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch history.", details: err.message });
  }
};
