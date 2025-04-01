const User = require("../../models/User");

exports.updateProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash("error", "You must be logged in.");
            return res.redirect("/login");
        }

        const { first_name, last_name, phone, address } = req.body;
        const userId = req.session.user.id;

        await User.findByIdAndUpdate(userId, { first_name, last_name, phone, address });

        // Update session user data
        req.session.user.first_name = first_name;
        req.session.user.last_name = last_name;
        req.session.user.phone = phone;
        req.session.user.address = address;

        req.flash("success", "Profile updated successfully!");
        return res.redirect("/profile");
    } catch (error) {
        console.error("Error updating profile:", error);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/profile");
    }
};
