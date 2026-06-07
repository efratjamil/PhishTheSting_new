const axios = require("axios");

function buildAnalysisSummary(analysis = {}) {
  try {
    return JSON.stringify(analysis, null, 2);
  } catch {
    return "{}";
  }
}

async function generateAiReply({ message, analysis, question }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  const prompt = `
אתה עוזר אבטחה שמסביר למשתמשים אם הודעה חשודה או לא.

חוקים:
- ענה רק בעברית.
- היה קצר, ברור ופשוט.
- השתמש רק במידע שסופק לך.
- אל תמציא מידע שלא קיים.
- אם אין מספיק מידע, תגיד שאינך בטוח.
- תמיד תסיים בהמלצה בטוחה וברורה למשתמש.

ההודעה המקורית:
${message}

ניתוח המערכת:
${buildAnalysisSummary(analysis)}

שאלת המשתמש:
${question}
`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    },
    {
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
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
  const apiKey = process.env.GEMINI_API_KEY;

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
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
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
      },
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const parsed = extractJsonObject(reply);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      isBrand: Boolean(parsed.isBrand),
      realBrandName:
        typeof parsed.realBrandName === "string" ? parsed.realBrandName.trim() : "",
      isLikelyImpersonation: Boolean(parsed.isLikelyImpersonation),
      confidence: Number.isFinite(Number(parsed.confidence))
        ? Math.max(0, Math.min(100, Number(parsed.confidence)))
        : 0,
      reason: typeof parsed.reason === "string" ? parsed.reason.trim() : "",
    };
  } catch {
    return null;
  }
}

module.exports = { generateAiReply, resolveBrandImpersonationWithGemini };
