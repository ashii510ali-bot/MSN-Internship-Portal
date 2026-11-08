
const mongoose = require("mongoose");

// ============================================================
// UNIFIED NOTIFICATION SCHEMA
// Supports intern, mentor, project manager and admin notifications.
// ============================================================

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    // String mirror of userId
    recipientId: {
      type: String,
      default: "",
      index: true,
    },

    recipientRole: {
      type: String,
      default: "intern",
      index: true,
    },

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
      default: "General",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Source information
    sourceRole: {
      type: String,
      default: "System",
    },

    sourceType: {
      type: String,
      default: "",
      index: true,
    },

    sourceId: {
      type: String,
      default: "",
    },

    relatedId: {
      type: String,
      default: "",
    },

    relatedType: {
      type: String,
      default: "",
    },

    relatedName: {
      type: String,
      default: "",
      trim: true,
    },

    link: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: String,
      default: "System",
    },

    senderRole: {
      type: String,
      default: "System",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================
// INTERN LAYOUT COMPATIBILITY
// Existing frontend uses notification.unread
// ============================================================

notificationSchema.virtual("unread").get(function readFlag() {
  return this.isRead === false;
});

// ============================================================
// KEEP USER ID AND RECIPIENT ID SYNCHRONIZED
// ============================================================

notificationSchema.pre("validate", function mirrorRecipient() {
  if (!this.userId && this.recipientId) {
    if (mongoose.Types.ObjectId.isValid(this.recipientId)) {
      this.userId = new mongoose.Types.ObjectId(this.recipientId);
    }
  }

  if (this.userId) {
    this.recipientId = String(this.userId);
  }
});

// ============================================================
// PREVENT DUPLICATE ANNOUNCEMENT NOTIFICATIONS
// One announcement can have only one notification per user.
// ============================================================

notificationSchema.index(
  {
    recipientId: 1,
    sourceType: 1,
    sourceId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      sourceType: "Announcement",
      sourceId: { $type: "string", $gt: "" },
    },
  }
);

// ============================================================
// EXPORT MODEL
// ============================================================

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
