const jwt = require("jsonwebtoken");
const { logSecurityEvent } = require("../services/auditLogService");

function extractBearerToken(authorizationHeader = "") {
  if (typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

async function authenticateToken(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    await logSecurityEvent({
      req,
      action: "protected_route_access",
      status: "failed",
      metadata: {
        reason: "missing_token",
        path: req.originalUrl,
        method: req.method,
      },
    });
    return res.status(401).json({ message: "נדרש טוקן אימות" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    return next();
  } catch (error) {
    await logSecurityEvent({
      req,
      action: "protected_route_access",
      status: "failed",
      metadata: {
        reason: "invalid_or_expired_token",
        path: req.originalUrl,
        method: req.method,
      },
    });
    return res.status(401).json({ message: "טוקן האימות אינו תקין או שפג תוקפו" });
  }
}

module.exports = { authenticateToken };
