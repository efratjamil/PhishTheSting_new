const { sendEmail } = require("../utils/sendEmail");

function getFrontendBaseUrl() {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

async function sendPasswordResetEmail({ email, resetLink, firstName }) {
  console.log("sendPasswordResetEmail: preparing password reset email", {
    email,
  });

  const subject = "קישור לאיפוס סיסמה";
  const text = `שלום ${firstName || ""},

קיבלנו בקשה לאיפוס הסיסמה שלך.
לחץ על הקישור הבא כדי לבחור סיסמה חדשה:
${resetLink}

אם לא ביקשת איפוס סיסמה, אפשר להתעלם מהמייל.
`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2>איפוס סיסמה</h2>
      <p>שלום ${firstName || ""},</p>
      <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#449ba2;color:#ffffff;text-decoration:none;border-radius:8px;">
          מעבר לעדכון סיסמה
        </a>
      </p>
      <p>או להדביק בדפדפן את הקישור הבא:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>אם לא ביקשת איפוס סיסמה, אפשר להתעלם מהמייל.</p>
    </div>
  `;

  const result = await sendEmail({
    to: email,
    subject,
    text,
    html,
  });

  if (result.skipped) {
    console.warn(
      "sendPasswordResetEmail: SMTP not configured, using development fallback",
      {
        email,
      },
    );

    return {
      delivered: false,
      fallback: true,
      failed: false,
    };
  }

  if (!result.ok) {
    console.error(
      "sendPasswordResetEmail: email sending failed but request flow will continue",
      {
        email,
        error: result.error || result.reason,
      },
    );

    return {
      delivered: false,
      fallback: false,
      failed: true,
    };
  }

  console.log("sendPasswordResetEmail: password reset email sent successfully", {
    email,
  });

  return {
    delivered: true,
    fallback: false,
    failed: false,
  };
}

module.exports = {
  getFrontendBaseUrl,
  sendPasswordResetEmail,
};
