const AuditLog = require("../models/AuditLog");

const SENSITIVE_KEYS = new Set([
  "password",
  "newpassword",
  "token",
  "refreshtoken",
  "authorization",
  "resetpasswordtoken",
  "resetlink",
  "cookie",
]);

function normalizeEmail(email) {
  if (typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  return normalized || null;
}

function extractClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

function sanitizeValue(value, depth = 0) {
  if (value == null || depth > 3) {
    return value ?? null;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
      if (SENSITIVE_KEYS.has(String(key).toLowerCase())) {
        return accumulator;
      }

      accumulator[key] = sanitizeValue(nestedValue, depth + 1);
      return accumulator;
    }, {});
  }

  if (typeof value === "string") {
    return value.length > 500 ? `${value.slice(0, 500)}...` : value;
  }

  return value;
}

async function logSecurityEvent({
  req,
  user,
  userId,
  email,
  action,
  status,
  metadata,
}) {
  try {
    await AuditLog.create({
      userId: user?._id || userId || req.user?.userId || null,
      email: normalizeEmail(email || user?.email || req.body?.email),
      action,
      status,
      ipAddress: extractClientIp(req),
      userAgent:
        typeof req.headers["user-agent"] === "string"
          ? req.headers["user-agent"].slice(0, 500)
          : null,
      metadata: sanitizeValue(metadata),
    });
  } catch (error) {
    console.error("audit log error:", error);
  }
}

module.exports = {
  extractClientIp,
  logSecurityEvent,
};
