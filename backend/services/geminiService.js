const axios = require("axios");

function buildAnalysisSummary(analysis = {}) {
  try {
    return JSON.stringify(analysis, null, 2);
  } catch {
    return "{}";
  }
}

function buildChatPrompt({ message, analysis, question }) {
  return `
You are a cybersecurity assistant helping a user understand a phishing analysis.

Rules:
- Respond only in Hebrew.
- Be concise, clear, and practical.
- Use only the supplied message and analysis context. Do not invent facts.
- Explain which checks were performed and why a link or message is suspicious, safe, or uncertain.
- When relevant, refer to manual findings, redirect expansion, SSL certificate data, Google Safe Browsing, brand impersonation, and marketing classification.
- Google Safe Browsing with no matches does not prove a link is legitimate.
- If information is missing or inconclusive, say so clearly.
- End with a concrete, safe recommendation for the user.

Original message:
${message}

Full analysis context:
${buildAnalysisSummary(analysis)}

User question:
${question}
`;
}

async function generateAiReply({ message, analysis, question }) {
  const apiKey = process.env.GEMINI_CHAT_API_KEY;

  if (!apiKey) {
    const error = new Error("GEMINI_CHAT_API_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          parts: [{ text: buildChatPrompt({ message, analysis, question }) }],
        },
      ],
    },
    {
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
      proxy: false,
    },
  );

  const reply =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  if (!reply) {
    const error = new Error("Gemini returned an empty reply");
    error.statusCode = 502;
    throw error;
  }

  return { reply };
}

function extractJsonObject(text = "") {
  const trimmed = String(text).trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
}

async function resolveBrandImpersonationWithGemini({
  candidateBrand,
  fullDomain,
  messageText,
  extractedUrls = [],
}) {
  const apiKey = process.env.GEMINI_BRAND_API_KEY;

  if (!apiKey) {
    return null;
  }

  const prompt = `
Return JSON only.

Task:
Decide whether the candidate string or domain looks like a known brand or an impersonation of a known brand.

Input:
- candidateBrand: ${candidateBrand || ""}
- fullDomain: ${fullDomain || ""}
- messageText: ${messageText || ""}
- extractedUrls: ${JSON.stringify(extractedUrls || [])}

Rules:
- Return JSON only.
- No markdown.
- If unsure, keep confidence moderate and explain the uncertainty.
- confidence must be a number from 0 to 100.

Required JSON schema:
{
  "isBrand": true,
  "realBrandName": "",
  "isLikelyImpersonation": true,
  "confidence": 0,
  "reason": ""
}
`;

  try {
    console.log("Gemini brand analysis started", {
      candidateBrand,
      fullDomain,
    });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        timeout: 12000,
        headers: {
          "Content-Type": "application/json",
        },
        proxy: false,
      },
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const parsed = extractJsonObject(reply);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const assessment = {
      isBrand: Boolean(parsed.isBrand),
      realBrandName:
        typeof parsed.realBrandName === "string"
          ? parsed.realBrandName.trim()
          : "",
      isLikelyImpersonation: Boolean(parsed.isLikelyImpersonation),
      confidence: Number.isFinite(Number(parsed.confidence))
        ? Math.max(0, Math.min(100, Number(parsed.confidence)))
        : 0,
      reason: typeof parsed.reason === "string" ? parsed.reason.trim() : "",
    };

    console.log("Gemini brand analysis completed", {
      isBrand: assessment.isBrand,
      realBrandName: assessment.realBrandName,
      isLikelyImpersonation: assessment.isLikelyImpersonation,
      confidence: assessment.confidence,
    });

    return assessment;
  } catch (error) {
    console.error("Gemini brand analysis failed", {
      code: error.code || null,
      status: error.response?.status || null,
      message: error.response?.data?.error?.message || error.message,
    });
    return null;
  }
}

module.exports = { generateAiReply, resolveBrandImpersonationWithGemini };
