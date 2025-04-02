const Notification = require("../../models/Notification");

// Fetch notifications for the admin
async function getNotifications(req, res) {
  try {
    const adminId = req.user._id; // Assuming `req.user` contains the authenticated admin
    const notifications = await Notification.find({ admin: adminId })
      .sort({ createdAt: -1 })
      .limit(10); // Fetch the latest 10 notifications
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications." });
  }
}

// Mark all notifications as read
async function markAllAsRead(req, res) {
  try {
    const adminId = req.user._id;
    await Notification.updateMany({ admin: adminId, read: false }, { read: true });
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({ success: false, message: "Failed to mark notifications as read." });
  }
}

// Create a new notification (for testing or other logic)
async function createNotification(req, res) {
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

module.exports = { getNotifications, markAllAsRead, createNotification };