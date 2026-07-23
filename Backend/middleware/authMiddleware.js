const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "globalassign_jwt_secret_key_2026_monochrome";

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // { id, role }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: "Not authorized, token invalid" });
    }
  } else {
    // If no token, allow anonymous or fallback mode with mock teacher ID
    req.user = { id: "anonymous_teacher", role: "teacher" };
    next();
  }
};

module.exports = { protect };
