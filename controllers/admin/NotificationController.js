const Notification = require("../../models/Notification");

class NotificationController {
  // Fetch notifications for the admin
  async getNotifications(req, res) {
    try {
      const adminId = req.session.adminUser.id;
      const notifications = await Notification.find({ admin: adminId })
        .sort({ createdAt: -1 })
        .limit(10); // Fetch the latest 10 notifications
      const unreadCount = await Notification.countDocuments({ admin: adminId, read: false });
      res.json({ success: true, notifications, unreadCount });
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ success: false, message: "Failed to fetch notifications." });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const adminId = req.session.adminUser._id;
      await Notification.updateMany({ admin: adminId, read: false }, { read: true });
      const unreadCount = await Notification.countDocuments({ admin: adminId, read: false });
      res.json({ success: true, unreadCount });
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      res.status(500).json({ success: false, message: "Failed to mark notifications as read." });
    }
  }

  // Create a new notification (for testing or other logic)
  async createNotification(req, res) {
    try {
      const { adminId, message, link } = req.body;
      const notification = new Notification({ admin: adminId, message, link });
      await notification.save();
      res.json({ success: true, notification });
    } catch (err) {
      console.error("Error creating notification:", err);
      res.status(500).json({ success: false, message: "Failed to create notification." });
    }
  }

  // Mark a specific notification as read and redirect to the link
  async markAsReadAndRedirect(req, res) {
    try {
      const notificationId = req.params.id;

      // Mark the notification as read
      await Notification.findByIdAndUpdate(notificationId, { read: true });

      // Fetch the updated unread count
      const adminId = req.session.adminUser._id;
      const unreadCount = await Notification.countDocuments({ admin: adminId, read: false });

      // Redirect to the notification's link
      const notification = await Notification.findById(notificationId);
      if (notification) {
        return res.json({ success: true, link: notification.link, unreadCount });
      } else {
        return res.status(404).json({ success: false, message: "Notification not found." });
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ success: false, message: "Failed to mark notification as read." });
    }
  }
}

module.exports = new NotificationController();