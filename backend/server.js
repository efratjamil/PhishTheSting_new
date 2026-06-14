require("dotenv").config();            
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
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

if (!process.env.JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:4173",
    "http://127.0.0.1:3000",
  ].filter(Boolean)
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
};

const app = express();

 connectDB();

app.use(helmet());
app.use(cors(corsOptions));
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
  authenticateToken,
  updateProfileLimiter,
  validateRequest(updateProfileSchema),
  authController.updateProfile,
);
app.post(
  "/update-password",
  authenticateToken,
  updateProfileLimiter,
  validateRequest(updatePasswordSchema),
  authController.updatePassword,
);      

const PORT = process.env.PORT || 5000;

 app.listen(PORT, () => {
  console.log(`נ€ Server running on http://localhost:${PORT}`);
});

