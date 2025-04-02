const User = require("../../../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const path = require("path");
const ejs = require("ejs");

class ForgotPasswordController {
  // Render Forgot Password Page
  async showForgotPasswordPage(req, res) {
    return res.render("front/auth/forgot-password", {
      errors: req.flash("errors"),
      success: req.flash("success"),
    });
  }

  // Handle Forgot Password Form Submission
  async handleForgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email, role: "user" });
      if (!user) {
        req.flash("errors", [{ msg: "No account found with that email." }]);
        return res.redirect("/forgot-password");
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Send reset email
      const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

      // Render the email content using EJS
      const emailHtml = await ejs.renderFile(
        path.join(__dirname, "../../../views/front/auth/reset-password-email.ejs"),
        { first_name: user.first_name, resetUrl }
      );

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset Request - GadgetVerse",
        html: emailHtml
      });

      req.flash("success", "Password reset link sent to your email.");
      return res.redirect("/forgot-password");
    } catch (err) {
      console.error(err);
      console.error("Error in handleForgotPassword:", err.message);
      req.flash("errors", [{ msg: "An error occurred. Please try again later." }]);
      return res.redirect("/forgot-password");
    }
  }

  // Render Reset Password Page
  async showResetPasswordPage(req, res) {
    return res.render("front/auth/reset-password", {
      token: req.params.token,
      errors: req.flash("errors"),
    });
  }

  // Handle Reset Password Form Submission
  async handleResetPassword(req, res) {
    const { token } = req.params;
    const { new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      req.flash("errors", [{ msg: "Passwords do not match." }]);
      return res.redirect(`/reset-password/${token}`);
    }

    if (new_password.length < 8) {
      req.flash("errors", [{ msg: "Password must be at least 8 characters long." }]);
      return res.redirect(`/reset-password/${token}`);
    }

    try {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        req.flash("errors", [{ msg: "Invalid or expired token." }]);
        return res.redirect("/forgot-password");
      }

      // Update the password
      user.password = await bcrypt.hash(new_password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      req.flash("success", "Password reset successfully. You can now log in.");
      return res.redirect("/login");
    } catch (err) {
      console.error(err);
      console.error("Error in handleResetPassword:", err.message);
      req.flash("errors", [{ msg: "An error occurred. Please try again later." }]);
      return res.redirect(`/reset-password/${token}`);
    }
  }
}

module.exports = new ForgotPasswordController();