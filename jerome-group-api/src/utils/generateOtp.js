const crypto = require("crypto");
const generateOTP = () => {
  const otp = crypto.randomInt(100000, 1000000); // Generates a random 6-digit number
  return otp.toString();
};

module.exports = {
  generateOTP,
};
