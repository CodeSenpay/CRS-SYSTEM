const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = async (userId, userEmail) => {
  return jwt.sign({ userId, userEmail }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
