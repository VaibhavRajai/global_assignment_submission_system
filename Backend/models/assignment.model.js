const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        assignmentCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        token: {
            type: String,
            default: null,
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        dueDate: {
            type: Date,
            required: true,
        },

        totalMarks: {
            type: Number,
            default: 100,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
