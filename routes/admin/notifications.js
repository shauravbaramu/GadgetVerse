const express = require("express");
const router = express.Router();
const NotificationController = require("../../controllers/admin/NotificationController");
const ensureAuthenticatedAdmin = require("../../middlewares/auth");

// Fetch notifications
router.get("/notifications", ensureAuthenticatedAdmin, NotificationController.getNotifications);

// Mark all notifications as read
router.post("/notifications/mark-all-read", ensureAuthenticatedAdmin, NotificationController.markAllAsRead);

// Create a new notification (for testing purposes)
router.post("/notifications/create", ensureAuthenticatedAdmin, NotificationController.createNotification);

module.exports = router;