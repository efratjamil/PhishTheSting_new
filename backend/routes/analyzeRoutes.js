const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { analyzeLimiter, historyLimiter } = require("../middleware/rateLimiters");
const {
  analyzeMessageSchema,
  saveHistorySchema,
} = require("../validation/schemas");
const {
  analyzeMessage,
  saveAnalysisHistory,
  getUserHistory,
  deleteHistoryItem,
  getUserDashboardStats,
} = require("../controllers/analyzeController");

router.post(
  "/",
  analyzeLimiter,
  authenticateToken,
  validateRequest(analyzeMessageSchema),
  analyzeMessage,
);
router.post(
  "/history",
  historyLimiter,
  authenticateToken,
  validateRequest(saveHistorySchema),
  saveAnalysisHistory,
);
router.get("/dashboard", historyLimiter, authenticateToken, getUserDashboardStats);
router.get("/history", historyLimiter, authenticateToken, getUserHistory);
router.delete("/history/:id", historyLimiter, authenticateToken, deleteHistoryItem);

module.exports = router;
