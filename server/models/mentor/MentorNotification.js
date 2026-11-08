
const mongoose = require("mongoose");

const mentorNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "Submission",
        "Evaluation",
        "Task",
        "System",
        "Alert",
        "Announcement",
      ],
      default: "System",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sourceRole: {
      type: String,
      enum: ["Mentor", "Intern", "System", "Program Manager"],
      default: "System",
    },

    sourceType: {
      type: String,
      enum: [
        "Submission",
        "Evaluation",
        "Task",
        "System",
        "Announcement",
      ],
      default: "System",
    },

    sourceId: {
      type: String,
      default: "",
    },

    relatedId: {
      type: String,
      default: "",
    },

    relatedName: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: String,
      default: "System",
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.MentorNotification ||
  mongoose.model("MentorNotification", mentorNotificationSchema);
