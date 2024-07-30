const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization || req.body.token || req.query.token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Login to continue", success: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res
      .status(400)
      .json({
        message: "some error occured, try again after some time",
        success: false,
      });
  }
};

module.exports = {
  verifyToken,
};
