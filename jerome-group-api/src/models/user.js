const pool = require("../config/db");
const argon2 = require("argon2");
const mailer = require("../utils/sentOtpEmail");
const jwt = require("../utils/jwtProcess");
require("dotenv").config();

const authenticate = async (data) => {
  const { user_password } = data;
  try {
    const [result] = await pool.execute("CALL Login_User(?)", [data]);

    if (result[0][0].statuscode === 0) {
      return result[0][0];
    }

    if (result[0][0].statuscode === 400 || result[0][0].statuscode === 401) {
      return result[0][0];
    } else {
      const isValid = await argon2.verify(result[0][0].password, user_password);

      if (isValid) {
        const token = await jwt.generateToken(
          result[0][0].user_level,
          result[0][0].email
        );
        return { token, isApprove: 1 };
      } else {
        return { isApprove: 0 };
      }
    }
  } catch (err) {
    return { message: err.message };
  }
};

const register = async (data) => {
  try {
    const { user_password } = data;
    const hashedPassword = await argon2.hash(user_password);
    const newData = {
      ...data,
      user_password: hashedPassword,
    };

    const isEmailed = await mailer.sendOTPEmail(
      newData.user_email,
      newData.otp
    );

    if (isEmailed.statuscode != 1) {
      return { response: "No Intenet Connection", statuscode: 5 };
    } else {
      const [result] = await pool.execute("CALL Register_User(?)", [newData]);
      if (result[0][0].statuscode === 1) {
        return result[0][0];
      } else {
        return result[0][0];
      }
    }
  } catch (err) {
    return { message: err.message };
  }
};

const logout = async (data) => {
  try {
    const [result] = await pool.execute("CALL Logout_User(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const updateOtp = async (data) => {
  try {
    const [result] = await pool.execute("CALL OTP_Update(?)", [data]);
    if (result[0][0].statuscode === 0) {
      return result[0][0];
    } else {
      const isEmailed = await mailer.sendOTPEmail(
        data.user_email,
        data.updatedOtp
      );

      return isEmailed.statuscode === 1
        ? result[0][0]
        : { message: "Failed to send Email please check your email Format" };
    }
  } catch (err) {
    return { message: err.message };
  }
};

const verifyEmail = async (data) => {
  try {
    const [result] = await pool.execute("CALL Verify_Email(?)", [data]);
    return result[0][0];
  } catch (err) {
    return { message: err.message };
  }
};

const checkMFAStatus = async (data) => {
  try {
    const [result] = await pool.execute("CALL Get_MFA_Status(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const getUserSecret = async (data) => {
  try {
    const [result] = await pool.execute("CALL Get_User_Secret(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const getUserData = async (data) => {
  try {
    const [result] = await pool.execute("CALL Get_User(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const storeUserSecret = async (data) => {
  try {
    const [result] = await pool.execute("CALL Store_Secret(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const MFAEnable = async (data) => {
  try {
    const [result] = await pool.execute("CALL Enable_MFA(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const storeToken = async (data) => {
  try {
    const [result] = await pool.execute("CALL Store_Token(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const storePublicKey = async (data) => {
  try {
    const [result] = await pool.execute("CALL Store_PublicKey(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const getPublicKey = async (data) => {
  try {
    const [result] = await pool.execute("CALL Get_PublicKey(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const scannedSuccess = async (data) => {
  try {
    const [result] = await pool.execute("CALL Store_Scanned_Success(?)", [
      data,
    ]);

    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};
const scannedStatus = async (data) => {
  try {
    const [result] = await pool.execute("CALL Check_Scan_Status(?)", [data]);

    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const getUserLevel = async (data) => {
  try {
    const [result] = await pool.execute("CALL Get_User_Level(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

const undoMFA = async (data) => {
  try {
    const [result] = await pool.execute("CALL Undo_MFA(?)", [data]);
    return result[0][0];
  } catch (err) {
    return result[0][0];
  }
};

module.exports = {
  authenticate,
  register,
  updateOtp,
  verifyEmail,
  checkMFAStatus,
  getUserSecret,
  storeUserSecret,
  MFAEnable,
  storeToken,
  storePublicKey,
  getPublicKey,
  scannedSuccess,
  scannedStatus,
  logout,
  getUserData,
  getUserLevel,
  undoMFA,
};
