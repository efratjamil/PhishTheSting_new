const rateLimit = require("express-rate-limit");

function createLimiter(windowMs, max, message) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: message,
    },
  });
}

const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many authentication attempts. Please try again later.",
);

const updateProfileLimiter = createLimiter(
  15 * 60 * 1000,
  20,
  "Too many profile update attempts. Please try again later.",
);

const analyzeLimiter = createLimiter(
  15 * 60 * 1000,
  40,
  "Too many analysis requests. Please try again later.",
);

const linkSafetyLimiter = createLimiter(
  15 * 60 * 1000,
  60,
  "Too many link safety checks. Please try again later.",
);

const historyLimiter = createLimiter(
  15 * 60 * 1000,
  80,
  "Too many history requests. Please try again later.",
);

const aiChatLimiter = createLimiter(
  15 * 60 * 1000,
  30,
  "Too many AI chat requests. Please try again later.",
);

module.exports = {
  authLimiter,
  updateProfileLimiter,
  analyzeLimiter,
  linkSafetyLimiter,
  historyLimiter,
  aiChatLimiter,
};
