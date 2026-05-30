const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  getFrontendBaseUrl,
  sendPasswordResetEmail,
} = require("../services/mailService");

function buildUserPayload(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

function respondWithServerError(res) {
  return res.status(500).json({ message: "Something went wrong" });
}

function signAuthToken(user) {
  return jwt.sign(
    {
      userId: String(user._id),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function looksLikeBcryptHash(value = "") {
  return typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
}

async function verifyPasswordAndUpgradeIfNeeded(user, password) {
  if (!user?.password) {
    return false;
  }

  if (looksLikeBcryptHash(user.password)) {
    return bcrypt.compare(password, user.password);
  }

  if (user.password !== password) {
    return false;
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();
  return true;
}

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("register error:", err);
    return respondWithServerError(res);
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await verifyPasswordAndUpgradeIfNeeded(user, password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = signAuthToken(user);

    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user: buildUserPayload(user),
    });
  } catch (err) {
    console.error("login error:", err);
    return respondWithServerError(res);
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({
      user: buildUserPayload(user),
    });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return respondWithServerError(res);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("updatePassword error:", err);
    return respondWithServerError(res);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const email = typeof req.body.email === "string" ? normalizeEmail(req.body.email) : undefined;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof firstName === "string" && firstName.trim()) {
      user.firstName = firstName.trim();
    }

    if (typeof lastName === "string" && lastName.trim()) {
      user.lastName = lastName.trim();
    }

    if (typeof email === "string" && email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      user.email = email;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: buildUserPayload(user),
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return respondWithServerError(res);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    console.log("forgotPassword: reset requested", { email });

    const user = await User.findOne({ email });

    const successMessage =
      "If an account with that email exists, a password reset link has been sent.";

    if (!user) {
      console.log("forgotPassword: user not found, returning generic response");
      return res.status(200).json({ message: successMessage });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = expiresAt;
    await user.save();

    const resetLink = `${getFrontendBaseUrl()}/reset-password?token=${rawToken}`;
    const mailResult = await sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      resetLink,
    });

    console.log("forgotPassword: email send result", {
      email: user.email,
      delivered: mailResult.delivered,
      fallback: mailResult.fallback,
      failed: mailResult.failed,
    });

    return res.status(200).json({
      message: successMessage,
      ...(mailResult.fallback && process.env.NODE_ENV === "development"
        ? { resetLink }
        : {}),
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return respondWithServerError(res);
  }
};

exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("resetPasswordWithToken error:", err);
    return respondWithServerError(res);
  }
};
