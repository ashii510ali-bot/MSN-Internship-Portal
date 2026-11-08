
const Notification = require("../models/Notification");

// ============================================================
// GET CURRENT USER ID
// ============================================================

const getCurrentUserId = (req) => {
  return String(req.user._id);
};

// ============================================================
// CREATE NOTIFICATION
// ============================================================

const createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      recipientId,
      recipientRole,
      relatedId,
      relatedType,
      relatedName,
      link,
      priority,
      createdBy,
      senderRole,
      sourceRole,
      sourceType,
      sourceId,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification title is required.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification message is required.",
      });
    }

    // Announcement notifications are managed
    // through announcementController only.
    if (sourceType === "Announcement") {
      return res.status(400).json({
        success: false,
        message: "Use the announcement module for announcements.",
      });
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type: type || "Info",
      recipientId: recipientId || "",
      recipientRole: recipientRole || "",
      relatedId: relatedId || "",
      relatedType: relatedType || "",
      relatedName: relatedName || "",
      link: link || "",
      priority: priority || "Medium",
      isRead: false,
      createdBy: createdBy || "System",
      senderRole: senderRole || "System",
      sourceRole: sourceRole || senderRole || "System",
      sourceType: sourceType || "General",
      sourceId: sourceId || "",
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notification.",
      error: error.message,
    });
  }
};

// ============================================================
// GET CURRENT USER NOTIFICATIONS
// ============================================================

const getNotifications = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    const notifications = await Notification.find({
      recipientId: userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(
        (item) => !item.isRead
      ).length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

// ============================================================
// GET CURRENT USER UNREAD NOTIFICATIONS
// ============================================================

const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: getCurrentUserId(req),
      isRead: false,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get unread notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications.",
      error: error.message,
    });
  }
};

// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: getCurrentUserId(req),
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
      error: error.message,
    });
  }
};

// ============================================================
// MARK ONE NOTIFICATION AS UNREAD
// ============================================================

const markNotificationAsUnread = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: getCurrentUserId(req),
      },
      {
        $set: {
          isRead: false,
        },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as unread.",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification as unread error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
      error: error.message,
    });
  }
};

// ============================================================
// MARK ALL CURRENT USER NOTIFICATIONS AS READ
// ============================================================

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipientId: getCurrentUserId(req),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE CURRENT USER NOTIFICATION
// ============================================================

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: getCurrentUserId(req),
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
      data: notification,
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
};
