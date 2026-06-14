const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  getFrontendBaseUrl,
  sendPasswordResetEmail,
} = require("../services/mailService");
const { logSecurityEvent } = require("../services/auditLogService");

const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_TIME_MS = 15 * 60 * 1000;

function buildUserPayload(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

function respondWithServerError(res) {
  return res.status(500).json({ message: "אירעה שגיאה בשרת. נסו שוב מאוחר יותר." });
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

function getInvalidCredentialsMessage() {
  return "כתובת האימייל או הסיסמה שגויים";
}

function getAccountLockedMessage() {
  return "החשבון ננעל זמנית בעקבות ניסיונות התחברות שגויים רבים. נסו שוב מאוחר יותר.";
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

async function resetLoginLockState(user) {
  if (!user || (!user.loginAttempts && !user.lockUntil)) {
    return;
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();
}

function isAccountLocked(user) {
  return Boolean(user?.lockUntil && user.lockUntil > new Date());
}

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "יש למלא את כל השדות הנדרשים" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await logSecurityEvent({
        req,
        user: existingUser,
        email,
        action: "register",
        status: "failed",
        metadata: { reason: "email_already_registered" },
      });
      return res.status(400).json({ message: "כתובת האימייל כבר רשומה במערכת" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    await logSecurityEvent({
      req,
      user: newUser,
      action: "register",
      status: "success",
    });

    return res.status(201).json({ message: "ההרשמה הושלמה בהצלחה" });
  } catch (err) {
    console.error("register error:", err);
    return respondWithServerError(res);
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const invalidCredentialsMessage = getInvalidCredentialsMessage();

    const user = await User.findOne({ email });
    if (!user) {
      await logSecurityEvent({
        req,
        email,
        action: "login",
        status: "failed",
        metadata: { reason: "invalid_credentials" },
      });
      return res.status(400).json({ message: invalidCredentialsMessage });
    }

    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    if (isAccountLocked(user)) {
      await logSecurityEvent({
        req,
        user,
        action: "login",
        status: "blocked",
        metadata: {
          reason: "account_locked",
          lockUntil: user.lockUntil,
        },
      });
      return res.status(423).json({ message: getAccountLockedMessage() });
    }

    const passwordMatches = await verifyPasswordAndUpgradeIfNeeded(user, password);

    if (!passwordMatches) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      const metadata = {
        reason: "invalid_credentials",
        loginAttempts: user.loginAttempts,
        attemptsRemaining: Math.max(MAX_LOGIN_ATTEMPTS - user.loginAttempts, 0),
      };

      let responseStatus = 400;
      let responseMessage = invalidCredentialsMessage;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_TIME_MS);
        responseStatus = 423;
        responseMessage = getAccountLockedMessage();
      }

      await user.save();

      await logSecurityEvent({
        req,
        user,
        action: "login",
        status: responseStatus === 423 ? "blocked" : "failed",
        metadata: {
          ...metadata,
          ...(user.lockUntil ? { lockUntil: user.lockUntil } : {}),
        },
      });

      if (responseStatus === 423) {
        await logSecurityEvent({
          req,
          user,
          action: "account_lockout",
          status: "blocked",
          metadata: {
            loginAttempts: user.loginAttempts,
            lockUntil: user.lockUntil,
          },
        });
      }

      return res.status(responseStatus).json({ message: responseMessage });
    }

    await resetLoginLockState(user);

    const token = signAuthToken(user);
    await logSecurityEvent({
      req,
      user,
      action: "login",
      status: "success",
    });

    return res.status(200).json({
      message: "התחברת בהצלחה",
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
      return res.status(401).json({ message: "נדרש אימות משתמש" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ message: "נדרש אימות משתמש" });
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
      return res.status(401).json({ message: "נדרש אימות משתמש" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      await logSecurityEvent({
        req,
        userId: req.user.userId,
        action: "password_change",
        status: "failed",
        metadata: { reason: "user_not_found" },
      });
      return res.status(404).json({ message: "המשתמש לא נמצא" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    await logSecurityEvent({
      req,
      user,
      action: "password_change",
      status: "success",
    });

    return res.status(200).json({ message: "הסיסמה עודכנה בהצלחה" });
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
      return res.status(401).json({ message: "נדרש אימות משתמש" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      await logSecurityEvent({
        req,
        userId: req.user.userId,
        action: "profile_update",
        status: "failed",
        metadata: { reason: "user_not_found" },
      });
      return res.status(404).json({ message: "המשתמש לא נמצא" });
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
        await logSecurityEvent({
          req,
          user,
          email,
          action: "profile_update",
          status: "failed",
          metadata: { reason: "email_already_in_use" },
        });
        return res.status(400).json({ message: "כתובת האימייל כבר נמצאת בשימוש" });
      }

      user.email = email;
    }

    await user.save();
    await logSecurityEvent({
      req,
      user,
      action: "profile_update",
      status: "success",
    });

    return res.status(200).json({
      message: "הפרופיל עודכן בהצלחה",
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
      "אם קיים חשבון עם כתובת האימייל הזו, נשלח קישור לאיפוס סיסמה.";

    if (!user) {
      console.log("forgotPassword: user not found, returning generic response");
      await logSecurityEvent({
        req,
        email,
        action: "password_reset_request",
        status: "failed",
        metadata: { reason: "account_not_found" },
      });
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
    await logSecurityEvent({
      req,
      user,
      action: "password_reset_request",
      status: "success",
      metadata: {
        delivered: mailResult.delivered,
        fallback: mailResult.fallback,
        failed: mailResult.failed,
      },
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
      await logSecurityEvent({
        req,
        action: "password_reset",
        status: "failed",
        metadata: { reason: "invalid_or_expired_token" },
      });
      return res.status(400).json({ message: "קישור איפוס הסיסמה אינו תקין או שפג תוקפו" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();
    await logSecurityEvent({
      req,
      user,
      action: "password_reset",
      status: "success",
    });

    return res.status(200).json({ message: "הסיסמה עודכנה בהצלחה" });
  } catch (err) {
    console.error("resetPasswordWithToken error:", err);
    return respondWithServerError(res);
  }
};
