
const Notification = require("../../models/Notification");

// ============================================================
// GET SUPER ADMIN NOTIFICATIONS
// ============================================================

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const unread = req.query.unread === "true";

    const query = {};

    if (category && category.toLowerCase() !== "all") {
      query.type = {
        $regex: new RegExp(`^${category}$`, "i"),
      };
    }

    if (unread) {
      query.isRead = false;
    }

    const total = await Notification.countDocuments(query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: notifications.map((n) => ({
        id: n._id,
        title: n.title || "Notification",
        message: n.message || n.description || "",
        description: n.description || n.message || "",
        category: n.type || "general",
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Super Admin notifications error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read.",
      data: {
        id: notification._id,
        isRead: notification.isRead,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
