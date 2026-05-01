const express = require("express");
const router = express.Router();
const { postScanLink, postCheckUrlSafety } = require("../controllers/linkController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { linkSafetyLimiter } = require("../middleware/rateLimiters");
const { urlPayloadSchema } = require("../validation/schemas");

router.post(
  "/check-safety",
  linkSafetyLimiter,
  authenticateToken,
  validateRequest(urlPayloadSchema),
  postCheckUrlSafety,
);
router.post(
  "/scan",
  linkSafetyLimiter,
  authenticateToken,
  validateRequest(urlPayloadSchema),
  postScanLink,
);

module.exports = router;
