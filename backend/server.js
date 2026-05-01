require("dotenv").config();            
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const mainRouter = require("./routes");
const { authenticateToken } = require("./middleware/authMiddleware");
const { validateRequest } = require("./middleware/validateRequest");
const { authLimiter, updateProfileLimiter } = require("./middleware/rateLimiters");
const {
  authRegisterSchema,
  authLoginSchema,
  forgotPasswordSchema,
  resetPasswordWithTokenSchema,
  updatePasswordSchema,
  updateProfileSchema,
} = require("./validation/schemas");

const app = express();

 connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", mainRouter);

// Aliases for compatibility with old frontend URLs
const authController = require("./controllers/authController");
app.post("/register", authLimiter, validateRequest(authRegisterSchema), authController.register);
app.post("/login", authLimiter, validateRequest(authLoginSchema), authController.login);
app.get("/current-user", authenticateToken, authController.getCurrentUser);
app.post(
  "/forgot-password",
  authLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword,
);
app.post(
  "/reset-password",
  authLimiter,
  validateRequest(resetPasswordWithTokenSchema),
  authController.resetPasswordWithToken,
);
app.post(
  "/update-profile",
  updateProfileLimiter,
  authenticateToken,
  validateRequest(updateProfileSchema),
  authController.updateProfile,
);
app.post(
  "/update-password",
  updateProfileLimiter,
  authenticateToken,
  validateRequest(updatePasswordSchema),
  authController.updatePassword,
);      

const PORT = process.env.PORT || 5000;

 app.listen(PORT, () => {
  console.log(`נ€ Server running on http://localhost:${PORT}`);
});

