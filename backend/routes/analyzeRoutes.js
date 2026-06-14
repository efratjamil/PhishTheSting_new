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
  authenticateToken,
  analyzeLimiter,
  validateRequest(analyzeMessageSchema),
  analyzeMessage,
);
router.post(
  "/history",
  authenticateToken,
  historyLimiter,
  validateRequest(saveHistorySchema),
  saveAnalysisHistory,
);
router.get("/dashboard", authenticateToken, historyLimiter, getUserDashboardStats);
router.get("/history", authenticateToken, historyLimiter, getUserHistory);
router.delete("/history/:id", authenticateToken, historyLimiter, deleteHistoryItem);

module.exports = router;
