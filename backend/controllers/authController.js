const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "אנא מלא את כל השדות" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "האימייל כבר רשום במערכת" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "נרשמת בהצלחה!" });
  } catch (err) {
    console.error("❌ שגיאה בהרשמה:", err);
    res.status(500).json({ message: "שגיאה בשרת", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "האימייל או הסיסמה שגויים" });
    }

    res.status(200).json({
      message: "✅ התחברת בהצלחה!",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ שגיאה בהתחברות:", err);
    res.status(500).json({ message: "שגיאה בשרת", error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "משתמש לא נמצא" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "✅ הסיסמה עודכנה בהצלחה!" });
  } catch (err) {
    console.error("❌ שגיאה בעדכון הסיסמה:", err);
    res.status(500).json({ message: "שגיאה בשרת", error: err.message });
  }
};
