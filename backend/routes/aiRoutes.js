const express = require("express");
const { postAiChat } = require("../controllers/aiController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { aiChatLimiter } = require("../middleware/rateLimiters");
const { aiChatSchema } = require("../validation/schemas");

const router = express.Router();

router.post(
  "/chat",
  aiChatLimiter,
  authenticateToken,
  validateRequest(aiChatSchema),
  postAiChat,
);

module.exports = router;
