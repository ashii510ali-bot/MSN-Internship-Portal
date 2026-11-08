
const express = require("express");

const router = express.Router();

const notificationsController = require(
  "../../controllers/superAdmin/notificationsController"
);

const protect = require("../../middleware/authMiddleware");
const allowRoles = require("../../middleware/roleMiddleware");

// Authentication and Super Admin access
router.use(protect);
router.use(allowRoles("super_admin"));

// Get notifications
router.get("/", notificationsController.getNotifications);

// Mark one notification as read
router.post("/:id/read", notificationsController.markRead);

// Mark all notifications as read
router.post("/read-all", notificationsController.markAllRead);

module.exports = router;
