const User = require("../../models/User");

class ProfileController {
  // View Profile
  async viewProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).lean(); // Use req.user.id
      if (!user) return res.status(404).send("User not found");

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
      const user = await User.findById(req.user.id); // Use req.user.id
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
}

module.exports = new ProfileController();
