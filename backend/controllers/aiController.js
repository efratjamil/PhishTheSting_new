const { generateAiReply } = require("../services/geminiService");

async function postAiChat(req, res) {
  try {
    const { message, analysis, question } = req.body;

    const result = await generateAiReply({
      message,
      analysis,
      question,
    });

    return res.json(result);
  } catch (error) {
    console.error("postAiChat error:", error.response?.data || error.message);
    return res.status(error.statusCode || 500).json({
      error: "AI chat failed",
      details: error.response?.data || error.message,
    });
  }
}

module.exports = { postAiChat };
