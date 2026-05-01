const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  authLimiter,
  updateProfileLimiter,
} = require("../middleware/rateLimiters");
const {
  authRegisterSchema,
  authLoginSchema,
  forgotPasswordSchema,
  resetPasswordWithTokenSchema,
  updatePasswordSchema,
  updateProfileSchema,
} = require("../validation/schemas");

router.post("/register", authLimiter, validateRequest(authRegisterSchema), authController.register);
router.post("/login", authLimiter, validateRequest(authLoginSchema), authController.login);
router.get("/current-user", authenticateToken, authController.getCurrentUser);
router.post(
  "/forgot-password",
  authLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validateRequest(resetPasswordWithTokenSchema),
  authController.resetPasswordWithToken,
);
router.post(
  "/update-password",
  updateProfileLimiter,
  authenticateToken,
  validateRequest(updatePasswordSchema),
  authController.updatePassword,
);
router.post(
  "/update-profile",
  updateProfileLimiter,
  authenticateToken,
  validateRequest(updateProfileSchema),
  authController.updateProfile,
);

module.exports = router;
