const express = require("express");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "globalassign_jwt_secret_key_2026_monochrome";

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "7d"
  });
};

// POST /api/auth/signup - Strict Registration
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Please enter your full name." });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, error: "Password must be at least 4 characters long." });
    }

    if (!role || (role !== "teacher" && role !== "student")) {
      return res.status(400).json({ success: false, error: "Please select a role (Teacher or Student)." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if account already exists in Teacher or Student collection
    const existingTeacher = await Teacher.findOne({ email: cleanEmail });
    const existingStudent = await Student.findOne({ email: cleanEmail });

    if (existingTeacher || existingStudent) {
      return res.status(400).json({ 
        success: false, 
        error: "An account with this email already exists. Please switch to Log In." 
      });
    }

    let user;
    if (role === "teacher") {
      user = await Teacher.create({ name: name.trim(), email: cleanEmail, password, role: "teacher" });
    } else {
      user = await Student.create({ name: name.trim(), email: cleanEmail, password, role: "student" });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login - Strict Authentication
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: "Please enter your email address." });
    }

    if (!password) {
      return res.status(400).json({ success: false, error: "Please enter your password." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Search in Teacher and Student database collections
    let user = await Teacher.findOne({ email: cleanEmail });
    if (!user) {
      user = await Student.findOne({ email: cleanEmail });
    }

    // STRICT CHECK 1: If user does NOT exist in database, reject login!
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "No account found with this email. Please sign up first." 
      });
    }

    // STRICT CHECK 2: Password comparison
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: "Incorrect password. Please verify your password and try again." 
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "Log in successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
