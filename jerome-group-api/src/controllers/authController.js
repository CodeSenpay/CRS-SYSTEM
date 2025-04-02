const User = require("../models/user");
const otp = require("../utils/generateOtp");
const { verifyToken } = require("../utils/jwtProcess");
const { authenticate, authenticator } = require("otplib");
const QRCode = require("qrcode");
const TotpAuthenticator = require("../utils/TotpAuthenticator");
const e = require("express");

const login = async (req, res) => {
  if (!req.body || Object.keys(req.body).length == 0) {
    res.json({ message: "No data sent!" });
  } else {
    try {
      const userInfo = await User.authenticate(req.body);

      if (userInfo["statuscode"] === 400 || userInfo["statuscode"] === 401) {
        return res.json(userInfo);
      }

      if (userInfo["statuscode"] === 0) {
        res.json({
          message: "User Doesn't Exists!",
          statuscode: 404,
        });
      }

      if (userInfo["isApprove"] === 0) {
        res.json({ message: "Wrong Password, Try Again!", statuscode: 0 });
      } else {
        const isMFAEnabled = await User.checkMFAStatus(req.body.user_email);

        if (isMFAEnabled["statuscode"] === 200) {
          res.status(200).json({
            message: "MFA is Enabled",
            statuscode: 1,
            mfa: 1,
          });
        }

        if (isMFAEnabled["statuscode"] === 404) {
          const isTokenInserted = await User.storeToken({
            email: req.body.user_email,
            token: userInfo["token"],
          });

          if (isTokenInserted.statuscode === 1) {
            res.cookie("token", userInfo["token"], {
              httpOnly: true,
              secure: false,
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
              message: "Login Success!",
              statuscode: 1,
              mfa: 0,
            });
          }
        }
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

const signup = async (req, res) => {
  if (!req.body || Object.keys(req.body).length == 0) {
    res.json({ message: "Error: No Data is sent" });
  } else {
    const emailOtp = otp.generateOTP();
    const newData = { ...req.body, otp: emailOtp };
    try {
      const result = await User.register(newData);
      res.json(result);
    } catch (err) {
      res.json({ message: "Error Registering" });
    }
  }
};

const verifyEmail = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ message: "Error: No Data is sent" });
  } else {
    try {
      const result = await User.verifyEmail(req.body);
      res.json(result);
    } catch (err) {
      res.json({ message: "Controller Error" });
    }
  }
};

const resendOtp = async (req, res) => {
  const updatedOtp = otp.generateOTP();
  const newData = { ...req.body, updatedOtp };

  try {
    const result = await User.updateOtp(newData);
    res.json(result);
  } catch (err) {
    res.json({ message: "Error in the Controller" });
  }
};

const logoutUser = async (req, res) => {
  try {
    response = await User.logout(req.body);
    res.clearCookie("token");
    res.json(response);
  } catch (err) {
    res.json(err.message);
  }
};

const MFAEnable = async (req, res) => {
  try {
    const response = await User.checkMFAStatus(req.body.email);

    if (response["statuscode"] === 200) {
      res.status(200).json(response);
    } else {
      res.json(response);
    }
  } catch (err) {
    res.status(404).json("Unable to check MFA Status");
  }
};

const generateSecretKey = async (req, res) => {
  const totp = new TotpAuthenticator();
  const secret = await totp.generateSecretKey();

  const otpauthURL = authenticator.keyuri(
    req.body.email,
    "JRMSUCashiering",
    secret
  );

  const qrcode = await QRCode.toDataURL(otpauthURL);
  res.json({ qrcode, secret, otpauthURL });
};

const markScannedSuccess = async (req, res) => {
  try {
    const response = await User.scannedSuccess(req.body);
    res.json(response);
  } catch (err) {
    console.log(err.message);
  }
};

const getUserLevel = async (req, res) => {
  try {
    const response = await User.getUserLevel(req.body);
    res.json(response);
  } catch (err) {
    console.log(err.message);
  }
};

const checkScanStatus = async (req, res) => {
  try {
    const response = await User.scannedStatus(req.body);
    res.json(response);
  } catch (err) {
    console.log(err.message);
  }
};

const storeSecretKey = async (req, res) => {
  try {
    const response = await User.storeUserSecret(req.body);
    res.json(response);
  } catch (err) {
    console.log(err.message);
  }
};

const getSecretForLogin = async (req, res) => {
  const totp = new TotpAuthenticator();
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ message: "No Data sent" });
  } else {
    const response = await User.getUserSecret({ email: req.body.user });
    const otpCode = totp.generateTotp(response["secret_key"]);

    res.json({ secret_key: otpCode });
  }
};

const storePublicKeyForEncryption = async (req, res) => {
  try {
    const response = await User.storePublicKey({
      secret: req.body.secret,
      publicKey: req.body.publicKey,
    });
    res.json({ response });
  } catch (err) {
    res.json(err.message);
  }
};

const getPublicKeyForLogin = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ message: "No data sent" });
  } else {
    const response = await User.getPublicKey({ email: req.body.user });
    res.json(response);
  }
};

const unEnableMFA = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    res.json({ message: "No data sent" });
  } else {
    try {
      const response = await User.undoMFA(req.body);
      if (response.isSuccess) {
        res.json({ statuscode: 1, message: response.message });
      } else {
        res.json({ statuscode: 0, message: response.message });
      }
    } catch (err) {
      res.status(500).json(err.meesage);
    }
  }
};

const backupData = async () => {};
const confirmPayment = async () => {};
const confirmPassword = async (req, res) => {};

module.exports = {
  login,
  signup,
  verifyEmail,
  resendOtp,
  logoutUser,
  MFAEnable,
  generateSecretKey,
  storeSecretKey,
  getSecretForLogin,
  storePublicKeyForEncryption,
  getPublicKeyForLogin,
  markScannedSuccess,
  checkScanStatus,
  getUserLevel,
  confirmPassword,
  confirmPayment,
  unEnableMFA,
  backupData,
};
