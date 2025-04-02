const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/admin/NotificationController");

// Fetch notifications
router.get("/", notificationController.getNotifications);

// Mark all notifications as read
router.post("/mark-all-read", notificationController.markAllAsRead);

// Create a new notification (for testing purposes)
router.post("/create", notificationController.createNotification);

// Mark a specific notification as read and redirect to the link
// Mark a specific notification as read and redirect to the link
router.get("/read/:id", (req, res) =>
    notificationController.markAsReadAndRedirect(req, res)
  );

module.exports = router;