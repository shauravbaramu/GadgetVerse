function fetchNotifications() {
  $.ajax({
    url: "/admin/notifications",
    method: "GET",
    success: function (response) {
      if (response.success) {
        const notifications = response.notifications;
        const notificationCount = response.unreadCount; // Updated to use unreadCount from the response
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
        if (notifications.length > 0) {
          notifications.forEach((notification) => {
            notificationDropdown.append(`
              <a href="#" class="dropdown-item text-wrap notification-link" data-id="${notification._id}" data-link="${notification.link}" style="white-space: normal;">
                <div class="d-flex align-items-center">
                  <i class="fas fa-info-circle mr-2"></i>
                  <span class="notification-message flex-grow-1">${notification.message}</span>
                  <span class="float-right text-muted text-sm ml-4">${new Date(notification.createdAt).toLocaleTimeString()}</span>
                </div>
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
        const notificationCountBadge = $("#notification-count");
        notificationCountBadge.hide(); // Hide the badge since all are read
        fetchNotifications(); // Refresh notifications
      }
    },
    error: function (err) {
      console.error("Error marking notifications as read:", err);
    },
  });
});

// Mark a specific notification as read and redirect
$(document).on("click", ".notification-link", function (e) {
  e.preventDefault();

  const notificationId = $(this).data("id");
  const notificationLink = $(this).data("link");

  // Mark the notification as read
  $.ajax({
    url: `/admin/notifications/read/${notificationId}`,
    method: "GET",
    success: function (response) {
      if (response.success) {
        // Update the notification count
        const unreadCount = response.unreadCount;
        const notificationCountBadge = $("#notification-count");

        if (unreadCount > 0) {
          notificationCountBadge.text(unreadCount).show();
        } else {
          notificationCountBadge.hide();
        }

        // Redirect to the notification's link
        window.location.href = notificationLink;
      }
    },
    error: function (err) {
      console.error("Error marking notification as read:", err);
    },
  });
});

// Fetch notifications every 5 seconds
setInterval(fetchNotifications, 5000);
fetchNotifications(); // Initial fetch