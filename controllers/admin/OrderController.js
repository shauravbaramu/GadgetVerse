const BaseController = require("./BaseController");
const Order = require("../../models/Order");
const path = require("path");
const ejs = require("ejs");

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
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        const items = await this.Model.find().populate("user").lean();

        const data = await Promise.all(
          items.map(async (item, index) => {
            const user = item.user
              ? `<a href="/admin/users/show/${item.user._id}" target="blank" style:"text-decoration: none">${item.user.first_name} ${item.user.last_name}</a>`
              : "N/A";

            const actionPartialPath = path.join(
              __dirname,
              "../../views/admin/orders/index_actions.ejs"
            );
            const actionHtml = await ejs.renderFile(actionPartialPath, {
              item,
            });

            let statusText;
            switch (item.status) {
              case "pending":
                statusText = "Pending";
                break;
              case "processing":
                statusText = "Processing";
                break;
              case "shipped":
                statusText = "Shipped";
                break;
              case "delivered":
                statusText = "Delivered";
                break;
              case "cancelled":
                statusText = "Cancelled";
                break;
              default:
                statusText = "Unknown";
            }

            return {
              id: item._id,
              DT_RowIndex: index + 1,
              user: user,
              status: statusText,
              totalPrice: item.totalPrice,
              createdAt: item.createdAt.toLocaleString(),
              action: actionHtml,
            };
          })
        );

        return res.json({ data });
      } else {
        const items = await this.Model.find().populate("user").lean();
        let crudInfo = this.crudInfo();
        return res.render(`${this.route}index`, { crudInfo, items });
      }
    } catch (err) {
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
      const item = await this.Model.findById(req.params.id);
      if (!item) return res.status(404).send("Order not found");

      item.status = req.body.status;
      await item.save();

      req.flash("success", `${this.title} status updated successfully.`);
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
      if (
        ![
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].includes(status)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }

      const item = await this.Model.findById(id);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // Update the status
      item.status = status;
      await item.save();

      return res.json({
        success: true,
        message: "Order status updated successfully",
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new OrderController();
