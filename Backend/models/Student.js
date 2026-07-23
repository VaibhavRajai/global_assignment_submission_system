const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true },
  password: { type: String, required: [true, "Password is required"] },
  role: { type: String, default: "student" },
  studentId: { type: String, default: () => "STU-" + Math.floor(1000 + Math.random() * 9000) },
  createdAt: { type: Date, default: Date.now }
});

StudentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

StudentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Student", StudentSchema);
