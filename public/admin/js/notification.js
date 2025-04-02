function fetchNotifications() {
  $.ajax({
    url: "/admin/notifications",
    method: "GET",
    success: function (response) {
      if (response.success) {
        const notifications = response.notifications;
        const notificationCount = notifications.length;
        const notificationDropdown = $("#notification-dropdown");
        const notificationCountBadge = $("#notification-count");

        // Update notification count
        if (notificationCount > 0) {
          notificationCountBadge.text(notificationCount).show();
        } else {
          notificationCountBadge.hide();
        }

        // Update dropdown
        notificationDropdown.empty();
        if (notificationCount > 0) {
          notifications.forEach((notification) => {
            notificationDropdown.append(`
                <a href="${notification.link}" class="dropdown-item">
                  <i class="fas fa-info-circle mr-2"></i> ${
                    notification.message
                  }
                  <span class="float-right text-muted text-sm">${new Date(
                    notification.createdAt
                  ).toLocaleTimeString()}</span>
                </a>
                <div class="dropdown-divider"></div>
              `);
          });
          notificationDropdown.append(`
              <a href="#" class="dropdown-item dropdown-footer" id="mark-all-read">
                Mark All as Read
              </a>
            `);
        } else {
          notificationDropdown.append(`
              <span class="dropdown-item dropdown-header">No Notifications</span>
            `);
        }
      }
    },
    error: function (err) {
      console.error("Error fetching notifications:", err);
    },
  });
}

// Mark all notifications as read
$(document).on("click", "#mark-all-read", function (e) {
  e.preventDefault();
  $.ajax({
    url: "/admin/notifications/mark-all-read",
    method: "POST",
    success: function (response) {
      if (response.success) {
        fetchNotifications(); // Refresh notifications
      }
    },
    error: function (err) {
      console.error("Error marking notifications as read:", err);
    },
  });
});

// Fetch notifications every 10 seconds
setInterval(fetchNotifications, 10000);
fetchNotifications(); // Initial fetch
