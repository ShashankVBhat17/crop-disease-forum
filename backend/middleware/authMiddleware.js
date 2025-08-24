const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  let token = req.header("Authorization");

  // No token found
  if (!token) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  // If token starts with "Bearer ", strip it
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, "secret123");
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(400).json({ msg: "Invalid token" });
  }
};

module.exports = auth;
