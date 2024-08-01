const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const verifyToken = (req, res, next) => {
  // Get token from headers, body, or query
  const token =
    req.headers.authorization?.split(" ")[1] ||
    req.body.token ||
    req.query.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Login to continue", success: false });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({
      message: "Invalid or expired token, please login again",
      success: false,
    });
  }
};

module.exports = {
  verifyToken,
};
