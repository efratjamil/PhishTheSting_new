const express = require("express");
const router = express.Router();
const { analyzeMessage } = require("../controllers/analyzeController");

router.post("/", analyzeMessage);

module.exports = router;
