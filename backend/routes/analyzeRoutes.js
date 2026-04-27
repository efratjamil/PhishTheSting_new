const express = require("express");
const router = express.Router();
const {
  analyzeMessage,
  saveAnalysisHistory,
  getUserHistory,
} = require("../controllers/analyzeController");

router.post("/", analyzeMessage);
router.post("/history", saveAnalysisHistory);
router.get("/history/:userId", getUserHistory);

module.exports = router;
