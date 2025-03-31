const User = require("../../../models/User");
const bcrypt = require("bcrypt");

class LoginController {
  // Render the login page
  async showLoginPage(req, res) {
    try {
      return res.render("admin/auth/login", {
        errors: req.flash("errors"),
        success: req.flash("success"),
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Handle login logic
  async login(req, res) {
    const { email, password, remember_me } = req.body; // Add `remember_me` from the form
    let errors = [];

    // Validate input
    if (!email || !password) {
      errors.push({ msg: "Please fill in all fields" });
      req.flash("errors", errors);
      return res.redirect("/admin/login");
    }

    try {
      // Find the user by email
      const user = await User.findOne({ email, role: "admin" });
      if (!user) {
        errors.push({ msg: "Invalid email or password" });
        req.flash("errors", errors);
        return res.redirect("/admin/login");
      }

      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        errors.push({ msg: "Invalid email or password" });
        req.flash("errors", errors);
        return res.redirect("/admin/login");
      }

      // Set session data for the logged-in admin
      req.session.user = {
        id: user._id,
        first_name: user.first_name, // Add first name
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      };

      // Handle "Remember Me" functionality
      if (remember_me) {
        // Extend the session expiration time
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
      } else {
        // Default session expiration time
        req.session.cookie.expires = false; // Session expires when the browser is closed
      }

      req.flash("success", "Login successful");
      return res.redirect("/admin");
    } catch (err) {
      errors.push({ msg: err.message });
      req.flash("errors", errors);
      return res.redirect("/admin/login");
    }
  }

  // Handle logout logic
  async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send("Error logging out");
        }
        res.redirect("/admin/login");
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new LoginController();
