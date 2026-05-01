const nodemailer = require("nodemailer");

function createTransporter() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn("sendEmail: SMTP configuration is incomplete.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, text, html }) {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      ok: false,
      skipped: true,
      reason: "SMTP_NOT_CONFIGURED",
    };
  }

  try {
    console.log("sendEmail: sending email", { to, subject });

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    console.log("sendEmail: email sent successfully", {
      to,
      messageId: result.messageId,
    });

    return {
      ok: true,
      skipped: false,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("sendEmail: failed to send email", {
      to,
      subject,
      error: error.message,
    });

    return {
      ok: false,
      skipped: false,
      reason: "SMTP_SEND_FAILED",
      error: error.message,
    };
  }
}

module.exports = { sendEmail };
