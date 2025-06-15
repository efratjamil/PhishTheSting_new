const analyzeTextContent = require("../utils/analyzeTextContent");

exports.analyzeMessage = (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "נדרש שדה הודעה (message) תקף." });
  }

  const result = analyzeTextContent(message);

  res.json({
    originalMessage: message,
    textAnalysis: result.isSuspicious,
    matchedWords: result.matchedWords,
  });
};
