const { text } = require("express");
const nodemailer = require("nodemailer");
const emailTemplate = require("../utils/emailTemplate");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "robertmayo.elumba@gmail.com",
    pass: "qytj gbsg rclb yeqv",
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: "robertmayo.elumba@gmail.com",
    to: email,
    subject: "Your Email OTP verification",
    html: emailTemplate.emailTemplate(otp),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { message: info.response, statuscode: 1 };
  } catch (err) {
    return { message: err, statuscode: 0 };
  }
};

module.exports = {
  sendOTPEmail,
};
