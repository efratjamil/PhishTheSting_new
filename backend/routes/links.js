const express = require("express");
const router = express.Router();
const { postScanLink, postCheckUrlSafety } = require("../controllers/linkController");

router.post("/check-safety", postCheckUrlSafety);
router.post("/scan", postScanLink);

module.exports = router;
