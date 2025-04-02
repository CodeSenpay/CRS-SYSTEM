require("dotenv").config();
const jwt = require("jsonwebtoken");
const middleWare = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded; // ✅ Send user info back
    next();
  });
};
module.exports = {
  middleWare,
};
