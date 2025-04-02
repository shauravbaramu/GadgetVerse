const BaseController = require("./BaseController");
const Order = require("../../models/Order");
const path = require("path");
const ejs = require("ejs");
const sendEmail = require("../../utils/mailer");

class OrderController extends BaseController {
  constructor() {
    super(Order, {
      title: "Order",
      subTitle: "Manage Orders",
      resources: "admin::orders.",
      route: "admin/orders/",
    });
  }

  // List all orders
  async index(req, res) {
    try {
      // Check if the request is AJAX (DataTables expects JSON)
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        const draw = req.query.draw || 1; // DataTables draw counter
        const start = parseInt(req.query.start) || 0; // Starting record index
        const length = parseInt(req.query.length) || 10; // Number of records per page
        const searchValue = req.query.search?.value || ""; // Search value
  
        // Build the query for filtering
        const query = searchValue
          ? {
              $or: [
                { "user.first_name": { $regex: searchValue, $options: "i" } },
                { "user.last_name": { $regex: searchValue, $options: "i" } },
                { status: { $regex: searchValue, $options: "i" } },
              ],
            }
          : {};
  
        // Get total records and filtered records
        const totalRecords = await this.Model.countDocuments();
        const filteredRecords = await this.Model.countDocuments(query);
  
        // Fetch the filtered data with pagination
        const items = await this.Model.find(query)
          .populate("user")
          .skip(start)
          .limit(length)
          .lean();
  
        // Format the data for DataTables
        const data = await Promise.all(
          items.map(async (item, index) => {
            const user = item.user
              ? `<a href="/admin/users/show/${item.user._id}" target="_blank">${item.user.first_name} ${item.user.last_name}</a>`
              : "N/A";
  
            const actionPartialPath = path.join(
              __dirname,
              "../../views/admin/orders/index_actions.ejs"
            );
            const actionHtml = await ejs.renderFile(actionPartialPath, { item });
  
            return {
              id: item._id,
              DT_RowIndex: start + index + 1,
              user: user,
              status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
              totalPrice: `$${item.totalPrice.toFixed(2)}`,
              createdAt: new Date(item.createdAt).toLocaleString(),
              action: actionHtml,
            };
          })
        );
  
        // Return the JSON response for DataTables
        return res.json({
          draw: parseInt(draw),
          recordsTotal: totalRecords,
          recordsFiltered: filteredRecords,
          data: data,
        });
      } else {
        // Regular page load: render the view
        const items = await this.Model.find().populate("user").lean();
        let crudInfo = this.crudInfo();
        return res.render(`${this.route}index`, { crudInfo, items });
      }
    } catch (err) {
      console.error("Error in index method:", err);
      return res.status(500).send(err.message);
    }
  }

  // Show a single order
  async show(req, res) {
    try {
      const item = await this.Model.findById(req.params.id)
        .populate("user items.product")
        .lean();
      if (!item) return res.status(404).send("Order not found");
      let crudInfo = this.crudInfo();
      crudInfo.item = item;
      return res.render(`${this.route}show`, { crudInfo, item });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Edit order status
  async edit(req, res) {
    try {
      const item = await this.Model.findById(req.params.id).lean();
      if (!item) return res.status(404).send("Order not found");

      let crudInfo = this.crudInfo();
      crudInfo.item = item;
      crudInfo.routeName = "Edit Status";

      // Pass an empty errors array to the template
      return res.render(`${this.route}edit`, { crudInfo, item, errors: [] });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Update order status
  async update(req, res) {
    let errors = [];
    if (
      !req.body.status ||
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        req.body.status
      )
    ) {
      errors.push({ msg: "Invalid status" });
    }

    if (errors.length > 0) {
      return res.render(`${this.route}edit`, {
        crudInfo: this.crudInfo(),
        errors,
        item: req.body,
      });
    }

    try {
      const item = await this.Model.findById(req.params.id).populate("user");
      if (!item) return res.status(404).send("Order not found");

      // Update the status
      item.status = req.body.status;
      await item.save();

      // Send email to the user
      const emailSubject = "Order Status Update - GadgetVerse";
      const templatePath = "orderStatusUpdate.ejs"; // Path to the EJS template
      const templateData = {
        user: item.user,
        status: req.body.status,
        orderLink: `${req.protocol}://${req.get("host")}/my-orders/${item._id}`, // Link to the order details
      };

      await sendEmail(item.user.email, emailSubject, templatePath, templateData);

      req.flash("success", `${this.title} status updated successfully and email sent to the user.`);
      return res.redirect(`/${this.route}`);
    } catch (err) {
      errors.push({ msg: err.message });
      return res.render(`${this.route}edit`, {
        crudInfo: this.crudInfo(),
        errors,
        item: req.body,
      });
    }
  }

  // Delete an order
  async delete(req, res) {
    try {
      const item = await this.Model.findById(req.params.id);
      if (!item) return res.status(404).send("Order not found");

      await this.Model.findByIdAndDelete(req.params.id);
      req.flash("success", `${this.title} deleted successfully.`);
      return res.redirect(`/${this.route}`);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Update order status via AJAX
  async updateStatus(req, res) {
    try {
      const { id, status } = req.body;

      // Validate the status
      if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }

      const item = await this.Model.findById(id).populate("user");
      if (!item) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // Update the status
      item.status = status;
      await item.save();

      // Send email to the user
      const emailSubject = "Order Status Update - GadgetVerse";
      const templatePath = "orderStatusUpdate.ejs"; // Path to the EJS template
      const templateData = {
        user: item.user,
        status,
        orderLink: `${req.protocol}://${req.get("host")}/my-orders/${item._id}`, // Link to the order details
      };

      await sendEmail(item.user.email, emailSubject, templatePath, templateData);

      return res.json({
        success: true,
        message: "Order status updated successfully and email sent to the user.",
      });
    } catch (err) {
      console.error("Error updating order status:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new OrderController();
