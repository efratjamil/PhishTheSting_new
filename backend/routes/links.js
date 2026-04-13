const express = require("express");
const router = express.Router();
const { postScanLink } = require("../controllers/linkController");

router.post("/scan", postScanLink);

module.exports = router;
