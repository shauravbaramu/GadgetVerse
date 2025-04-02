const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, templatePath, templateData) {
  try {
    // Render the EJS template
    const html = await ejs.renderFile(
      path.join(__dirname, "../views/emails", templatePath),
      templateData
    );

    const mailOptions = {
      from: `"GadgetVerse" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

module.exports = sendEmail;