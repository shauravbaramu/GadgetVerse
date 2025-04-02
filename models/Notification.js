const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // Admin receiving the notification
    message: { type: String, required: true }, // Notification message
    link: { type: String, required: true }, // Link to redirect when clicked
    read: { type: Boolean, default: false }, // Whether the notification is read
    createdAt: { type: Date, default: Date.now }, // Timestamp
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);