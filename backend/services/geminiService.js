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

module.exports = { generateAiReply };
