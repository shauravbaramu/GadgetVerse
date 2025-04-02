const Contact = require("../../models/ContactUs");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

class ContactController {
    async showContactPage(req, res) {
        try {
            return res.render("front/contactus");
        } catch (err) {
            console.error("Error rendering contact page:", err);
            req.flash("error", "An error occurred while rendering the contact page.");
            return res.redirect("/");
        }
    }
    
  async store(req, res) {
    try {
      const { name, email, message } = req.body;

      // Validate input
      if (!name || !email || !message) {
        req.flash("error", "All fields are required.");
        return res.redirect("/contactus");
      }

      // Save to database
      const contact = new Contact({ name, email, message });
      await contact.save();

      // Send a notification to the admin
           // Fetch the admin user with the role "admin"
           const admin = await User.findOne({ role: "admin" });
      
           if (!admin) {
             console.error("No admin found in the database.");
             return res.status(500).send("No admin available to receive notifications.");
           }
       
           // Use the admin's ID
           const adminId = admin._id;
           
          // Create a notification for the admin
          const notificationMessage = `New message.`;
          const notification = new Notification({
            admin: adminId,
            message: notificationMessage,
            link: `/admin/contacts/show/${contact._id}`, // Link to the order details page
          });
          await notification.save();

      req.flash("success", "Your message has been sent successfully!");
      return res.redirect("/contactus");
    } catch (err) {
      console.error("Error saving contact message:", err);
      req.flash("error", "An error occurred while sending your message. Please try again.");
      return res.redirect("/contactus");
    }
  }
}

module.exports = new ContactController();