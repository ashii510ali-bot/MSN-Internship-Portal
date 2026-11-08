
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    audience: {
      type: String,
      enum: [
        "All",
        "Interns",
        "Mentors",
        "Project Managers",

        // Legacy values: old announcements compatibility
        "All Interns",
        "All Mentors",
        "Program Managers",
      ],
      default: "All",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: String,
      default: "Program Manager",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Announcement",
  announcementSchema
);
