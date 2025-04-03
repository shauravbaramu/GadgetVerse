const User = require("../../../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const path = require("path");
const ejs = require("ejs");

class ForgetPasswordController {
  // Render Forgot Password Page
  async showForgotPasswordPage(req, res) {
    const { success, errors } = req.query; // Retrieve success and error messages from query parameters
    return res.render("front/auth/forgot-password", {
      errors: errors ? JSON.parse(errors) : [], // Parse errors if present
      success: success || "", // Pass success message if present
    });
  }

  // Handle Forgot Password Form Submission
  async handleForgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email, role: "user" }); // Ensure it's a user account
      if (!user) {
        const errors = JSON.stringify([{ msg: "No account found with that email." }]);
        return res.redirect(`/forgot-password?errors=${encodeURIComponent(errors)}`);
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      // Save the user
    try {
        await user.save();
      } catch (err) {
        console.error("Error saving user:", err.message);
        const errors = JSON.stringify([{ msg: "Failed to save reset token. Please try again later." }]);
        return res.redirect(`/forgot-password?errors=${encodeURIComponent(errors)}`);
      }

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
        html: emailHtml,
      });

      const success = "Password reset link sent to your email.";
      return res.redirect(`/forgot-password?success=${encodeURIComponent(success)}`);
    } catch (err) {
      console.error("Error in handleForgotPassword:", err.message);
      const errors = JSON.stringify([{ msg: "An error occurred. Please try again later." }]);
      return res.redirect(`/forgot-password?errors=${encodeURIComponent(errors)}`);
    }
  }

  // Render Reset Password Page
  async showResetPasswordPage(req, res) {
    const { errors } = req.query; // Retrieve error messages from query parameters
    return res.render("front/auth/reset-password", {
      token: req.params.token, // Pass the token to the view
      errors: errors ? JSON.parse(errors) : [], // Parse errors if present
    });
  }

  // Handle Reset Password Form Submission
  async handleResetPassword(req, res) {
    const { token } = req.params;
    const { new_password, confirm_password } = req.body;
  
    // Validate passwords
    if (new_password !== confirm_password) {
      const errors = JSON.stringify([{ msg: "Passwords do not match." }]);
      return res.redirect(`/reset-password/${token}?errors=${encodeURIComponent(errors)}`);
    }
  
    if (new_password.length < 8) {
      const errors = JSON.stringify([{ msg: "Password must be at least 8 characters long." }]);
      return res.redirect(`/reset-password/${token}?errors=${encodeURIComponent(errors)}`);
    }
  
    try {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
      });
  
      if (!user) {
        const errors = JSON.stringify([{ msg: "Invalid or expired token." }]);
        return res.redirect(`/forgot-password?errors=${encodeURIComponent(errors)}`);
      }
  
      // Update the password
      user.password = await bcrypt.hash(new_password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      const success = "Password reset successfully. You can now log in.";
      return res.redirect(`/login?success=${encodeURIComponent(success)}`);
    } catch (err) {
      console.error("Error in handleResetPassword:", err.message);
      const errors = JSON.stringify([{ msg: "An error occurred. Please try again later." }]);
      return res.redirect(`/reset-password/${token}?errors=${encodeURIComponent(errors)}`);
    }
  }
}

module.exports = new ForgetPasswordController();