const User = require("../models/User");

module.exports = {
  ensureAuthenticated: async (req, res, next) => {
    if (req.session.adminUser && req.session.adminUser.role === "admin") {
      try {
        // Fetch the full admin details from the database
        const user = await User.findById(req.session.adminUser.id).lean();
        if (!user) {
          req.flash("errors", [{ msg: "User not found. Please log in again." }]);
          return res.redirect("/admin/login");
        }

        // Populate req.user with the full admin details
        req.user = user;
        return next();
      } catch (err) {
        console.error("Error fetching user:", err.message);
        req.flash("errors", [{ msg: "An error occurred. Please log in again." }]);
        return res.redirect("/admin/login");
      }
    }

    req.flash("errors", [{ msg: "Please log in to access this page" }]);
    return res.redirect("/admin/login");
  },

  // Middleware to check if a regular user is logged in
  ensureAuthenticatedUser: async (req, res, next) => {
    if (req.session.user && req.session.user.role === "user") {
      try {
        const user = await User.findById(req.session.user.id).lean();
        if (!user) {
          req.flash("errors", [{ msg: "User not found. Please log in again." }]);
          return res.redirect("/login");
        }

        req.user = user; // Store user details in the request
        return next();
      } catch (err) {
        console.error("Error fetching user:", err.message);
        req.flash("errors", [{ msg: "An error occurred. Please log in again." }]);
        return res.redirect("/login");
      }
    }

    req.flash("errors", [{ msg: "Please log in to continue" }]);
    return res.redirect(`/login?redirect=${req.originalUrl}`);
  },

};