const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  },
  studentName: {
    type: String,
    required: [true, "Student name is required"]
  },
  fileName: {
    type: String,
    required: [true, "File name is required"]
  },
  fileUrl: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: "" // Stores text parsed via pdf-parse for Gemini AI summarization
  },
  fileHash: {
    type: String,
    default: () => "0x" + Math.random().toString(36).substring(2, 10).toUpperCase()
  },
  remark: {
    type: String,
    enum: ["Unchecked", "Checked", "Pass", "Fail"],
    default: "Unchecked"
  },
  status: {
    type: String,
    enum: ["Verified Safe", "Encrypted", "Under Review"],
    default: "Verified Safe"
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Submission", SubmissionSchema);
