const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const {
  verifyTotpCode,
  verifyTotpCodeLogin,
} = require("../controllers/totpController");
const { generateTotpCode } = require("../controllers/generateTotpController");

const authController = require("../controllers/authController");

router.post("/checkMFA", authController.MFAEnable);
router.post("/login", authController.login);
router.post("/register", authController.signup);
router.post("/resend-otp", authController.resendOtp);
router.post("/verify-email", authController.verifyEmail);
router.post("/logout", authController.logoutUser);
router.post("/generateSecret", authController.generateSecretKey);
router.post("/storeSecret", authController.storeSecretKey);
router.post("/getSecret", authController.getSecretForLogin);
router.post("/markSuccess", authController.markScannedSuccess);
router.post("/checkScanStatus", authController.checkScanStatus);
router.post("/getUserLevel", authController.getUserLevel);
router.post("/confirm-password");
router.post("/verify-totp", verifyTotpCode);
router.post("/verify-totp-login", verifyTotpCodeLogin);
router.post("/undo-mfa", authController.unEnableMFA);
router.post("/backup", authController.backupData);

router.post("/generateTotp", generateTotpCode);

router.post("/storePublicKey", authController.storePublicKeyForEncryption);

router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user.decoded });
});

router.get("/verify-jwt", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.json({ user: decoded }); // ✅ Send user info back
  });
});

module.exports = router;
