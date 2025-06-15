// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const cors = require("cors");

// const app = express();
// app.use(express.json());
// app.use(cors());

// // ✅ חיבור למסד הנתונים
// mongoose
//   .connect("mongodb://127.0.0.1:27017/phishingDB")
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => {
//     console.error("❌ Error connecting to MongoDB:", err);
//     process.exit(1);
//   });

// // ✅ סכמת המשתמש
// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const User = mongoose.model("User", userSchema);

// // ✅ API להרשמה (Register)
// app.post("/register", async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;

//     if (!firstName || !lastName || !email || !password) {
//       return res.status(400).json({ message: "אנא מלא את כל השדות" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "האימייל כבר רשום במערכת" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//     });

//     await newUser.save();
//     console.log("✅ משתמש חדש נוסף:", newUser);
//     res.status(201).json({ message: "נרשמת בהצלחה!" });
//   } catch (err) {
//     console.error("❌ שגיאה בהרשמה:", err);
//     res.status(500).json({ message: "שגיאה בשרת", error: err.message });
//   }
// });

// // ✅ API להתחברות (Login)
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "האימייל או הסיסמה שגויים" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "האימייל או הסיסמה שגויים" });
//     }

//     res.status(200).json({
//       message: "✅ התחברת בהצלחה!",
//       user: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     console.error("❌ שגיאה בהתחברות:", err);
//     res.status(500).json({ message: "שגיאה בשרת", error: err.message });
//   }
// });

// // ✅ API לעדכון סיסמה
// app.post("/update-password", async (req, res) => {
//   try {
//     const { email, newPassword } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "משתמש לא נמצא" });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;

//     await user.save();
//     res.status(200).json({ message: "✅ הסיסמה עודכנה בהצלחה!" });
//   } catch (err) {
//     console.error("❌ שגיאה בעדכון הסיסמה:", err);
//     res.status(500).json({ message: "שגיאה בשרת", error: err.message });
//   }
// });

// // ✅ התחלת השרת
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 5000;

// חיבור למסד הנתונים
connectDB();

// מידלוורים
app.use(cors());
app.use(express.json());

// ראוטים
app.use("/", authRoutes);
app.use("/api/analyze", require("./routes/analyzeRoutes"));

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
