const express = require("express");
const router = express.Router();
const { postScanLink } = require("../controllers/linkController");

// POST /api/links/scan
router.post("/scan", postScanLink);

module.exports = router;
