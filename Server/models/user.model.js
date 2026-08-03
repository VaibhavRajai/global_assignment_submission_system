const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    select: false,
    required: function () {
      return this.provider === "local";
    },
  },

  role: {
    type: String,
    enum: ["student", "teacher"],
    required: true,
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);