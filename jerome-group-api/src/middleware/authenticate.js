const { verifyToken } = require("../utils/jwtProcess");

const authenticate = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Authentication Required!" });
  }
  const decoded = await verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid Token" });
  }

  req.user = { decoded };
  next();
};

module.exports = { authenticate };
