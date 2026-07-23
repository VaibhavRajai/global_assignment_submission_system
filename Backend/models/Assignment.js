const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Assignment name/title is required"],
    trim: true
  },
  course: {
    type: String,
    default: "CS-101"
  },
  dueDate: {
    type: String,
    required: [true, "Due date is required"]
  },
  description: {
    type: String,
    default: "Standard assignment instructions."
  },
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => Math.floor(100000 + Math.random() * 900000).toString()
  },
  teacherId: {
    type: String,
    required: true
  },
  fileFormats: {
    type: String,
    default: "PDF, DOCX, ZIP, IPYNB"
  },
  enableAISummary: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ["Active", "Summarized", "Closed"],
    default: "Active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
