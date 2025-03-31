const BaseController = require("./BaseController");
const Order = require("../../models/Order");
const path = require("path");
const ejs = require('ejs');

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
            const actionPartialPath = path.join(
              __dirname,
              "../../views/admin/orders/index_actions.ejs"
            );
            const actionHtml = await ejs.renderFile(actionPartialPath, {
              item,
            });

            return {
              id: item._id,
              DT_RowIndex: index + 1,
              user: item.user ? item.user.name : "N/A",
              status: item.status,
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
      return res.render(`${this.route}edit`, { crudInfo, item });
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
}

module.exports = new OrderController();
