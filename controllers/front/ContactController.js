const Contact = require("../../models/ContactUs");

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