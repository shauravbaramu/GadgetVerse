const User = require("../../models/User");
const bcrypt = require("bcrypt");

class ProfileController {
  // View Profile
  async viewProfile(req, res) {
    try {
      const user = req.user;
      if (!user) 
        return res.status(404).send("User not found");

      return res.render("admin/profile/view", { user });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  async editProfile(req, res) {
    try {
      const item = await User.findById(req.params.id);
      if (!item) return res.status(404).send("Not found");
      return res.render("admin/profile/edit", {
        item,
        errors: req.flash("errors"),
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Update Profile (excluding password)
  async updateProfile(req, res) {
    let errors = [];
    const { first_name, last_name, email, phone, address } = req.body;
  
    // Validate required fields
    if (!first_name || !email || !phone || !address) {
      errors.push({ msg: "All required fields must be filled" });
    }
  
    if (errors.length > 0) {
      return res.render("admin/profile/view", { user: req.body, errors });
    }
  
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).send("User not found");
  
      // Update fields
      user.first_name = first_name;
      user.last_name = last_name;
      user.email = email;
      user.phone = phone;
      user.address = address;
  
      await user.save();
  
      req.flash("success", "Profile updated successfully.");
      return res.redirect("/admin/view-profile");
    } catch (err) {
      errors.push({ msg: err.message });
      return res.render("admin/profile/view", { user: req.body, errors });
    }
  }

  // Render Change Password Page
  async changePasswordPage(req, res) {
    try {
      return res.render("admin/profile/change-password", {
        errors: req.flash("errors"),
        success: req.flash("success"),
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Handle Change Password Logic
  async changePassword(req, res) {
    const { old_password, new_password, confirm_password } = req.body;
    let errors = [];

    // Validate input
    if (!old_password || !new_password || !confirm_password) {
      errors.push({ msg: "All fields are required" });
    }
    if (new_password !== confirm_password) {
      errors.push({ msg: "New password and confirm password do not match" });
    }

    if (new_password.length < 8) {
      errors.push({ msg: "New password must be at least 8 characters long" });
    }
    

    if (errors.length > 0) {
      req.flash("errors", errors);
      return res.redirect("/admin/change-password");
    }

    try {
      // Find the logged-in user
      const user = await User.findById(req.session.adminUser.id);
      if (!user) {
        req.flash("errors", [{ msg: "User not found" }]);
        return res.redirect("/admin/change-password");
      }

      // Check if the old password matches
      const isMatch = await bcrypt.compare(old_password, user.password);
      if (!isMatch) {
        req.flash("errors", [{ msg: "Old password is incorrect" }]);
        return res.redirect("/admin/change-password");
      }

      // Hash the new password and update it
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(new_password, salt);
      await user.save();

      req.flash("success", "Password changed successfully");
      return res.redirect("/admin/change-password");
    } catch (err) {
      req.flash("errors", [{ msg: err.message }]);
      return res.redirect("/admin/change-password");
    }
  }
}

module.exports = new ProfileController();
