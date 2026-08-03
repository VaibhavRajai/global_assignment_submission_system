const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        participation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssignmentParticipation",
            required: false,
        },

        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true,
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        fileUrl: {
            type: String,
            required: true,
        },

        fileKey: {
            type: String,
            default: "",
        },

        fileName: {
            type: String,
            default: "",
        },

        fileHash: {
            type: String,
            default: "",
        },

        type: {
            type: String,
            enum: ["document", "image", "other"],
            default: "document",
        },

        data: {
            type: String,
            default: "",
        },

        extractedAt: {
            type: Date,
            default: null,
        },

        submittedAt: {
            type: Date,
            default: Date.now,
        },

        marks: {
            type: Number,
            default: null,
        },

        feedback: {
            type: String,
            default: "",
        },

        remark: {
            type: String,
            default: "Unchecked",
        },

        aiFeedback: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "submitted",
                "late",
                "graded",
            ],
            default: "submitted",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Submission",
    submissionSchema
);
