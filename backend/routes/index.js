const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const analyzeRoutes = require("./analyzeRoutes");
const aiRoutes = require("./aiRoutes");
const linksRoutes = require("./links");

 router.use("/auth", authRoutes);
router.use("/analyze", analyzeRoutes);
router.use("/ai", aiRoutes);
router.use("/links", linksRoutes);

 router.get("/", (req, res) => {
  res.json({ ok: true, message: "PhishTheSting API is live 🚀" });
});

module.exports = router;
