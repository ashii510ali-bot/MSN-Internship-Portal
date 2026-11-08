
const express = require("express");

const {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All common notification routes require login
router.use(protect);

// GET CURRENT USER NOTIFICATIONS
router.get("/", getNotifications);

// GET CURRENT USER UNREAD NOTIFICATIONS
router.get("/unread", getUnreadNotifications);

// CREATE NOTIFICATION
// Only authorized management roles can create notifications
router.post(
  "/",
  allowRoles(
    "super_admin",
    "program_manager",
    "project_manager"
  ),
  createNotification
);

// MARK ALL AS READ
router.put(
  "/read-all",
  markAllNotificationsAsRead
);

// MARK ONE AS READ
router.put(
  "/:id/read",
  markNotificationAsRead
);

// MARK ONE AS UNREAD
router.put(
  "/:id/unread",
  markNotificationAsUnread
);

// DELETE NOTIFICATION
router.delete(
  "/:id",
  deleteNotification
);

module.exports = router;
