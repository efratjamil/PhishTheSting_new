require("dotenv").config();            
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const mainRouter = require("./routes");

const app = express();

 connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", mainRouter);

// Aliases for compatibility with old frontend URLs
const authController = require("./controllers/authController");
app.post("/register", authController.register);
app.post("/login", authController.login);
app.post("/update-profile", authController.updateProfile);
app.post("/update-password", authController.updatePassword);      

const PORT = process.env.PORT || 5000;

 app.listen(PORT, () => {
  console.log(`נ€ Server running on http://localhost:${PORT}`);
});

