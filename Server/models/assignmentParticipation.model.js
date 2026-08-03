const mongoose = require("mongoose");

const assignmentParticipationSchema = new mongoose.Schema(
    {
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

        joinedAt: {
            type: Date,
            default: Date.now,
        },

        hasSubmitted: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["Joined", "Uploaded", "Graded"],
            default: "Joined",
        },

        reminderCount: {
            type: Number,
            default: 0,
        },

        lastReminderSent: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate joins
assignmentParticipationSchema.index(
    {
        assignment: 1,
        student: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model(
    "AssignmentParticipation",
    assignmentParticipationSchema
);
