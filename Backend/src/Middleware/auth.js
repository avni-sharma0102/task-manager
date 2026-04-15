const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, "SECRET_KEY");

    req.userId = decoded.userId;

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

module.exports = auth;