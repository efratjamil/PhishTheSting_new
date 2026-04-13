const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/update-password", authController.updatePassword);
router.post("/update-profile", authController.updateProfile);

module.exports = router;
