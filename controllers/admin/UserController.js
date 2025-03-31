const BaseController = require("./BaseController");
const User = require("../../models/User");
const path = require("path");
const ejs = require("ejs");

class UserController extends BaseController {
  constructor() {
    super(User, {
      title: "User",
      subTitle: "Manage Users",
      resources: "admin::users.",
      route: "admin/users/",
    });
  }

  async index(req, res) {
    try {
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        const items = await this.Model.find({ role: "user" }).lean();
        const data = await Promise.all(
          items.map(async (item, index) => {
            const actionHtml = await ejs.renderFile(
              path.join(__dirname, "../../views/admin/users/index_actions.ejs"),
              { item }
            );
            return {
              id: item._id,
              DT_RowIndex: index + 1,
              first_name: item.first_name,
              email: item.email,
              phone: item.phone,
              address: item.address,
              action: actionHtml,
            };
          })
        );
        return res.json({ data });
      } else {
        const items = await this.Model.find();
        let crudInfo = this.crudInfo();
        return res.render(`${this.route}index`, {
          crudInfo,
          items,
          hideCreate: true,
          success: req.flash("success"),
          error: req.flash("error"),
        });
      }
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Show method to display user details
  async show(req, res) {
    try {
      const item = await this.Model.findById(req.params.id).lean();
      if (!item) {
        return res.status(404).send("User not found");
      }
      let crudInfo = this.crudInfo();
      return res.render(`${this.route}show`, {
        crudInfo,
        item,
        hideEdit: true,
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Delete method to remove a user
  async delete(req, res) {
    try {
      const item = await this.Model.findById(req.params.id);
      if (!item) return res.status(404).send("User not found");

      // Check if the user is an admin
      if (item.role === "admin") {
        req.flash("error", "Admins cannot be deleted.");
        return res.redirect(`/${this.route}`);
      }

      // Delete the user's orders
      await Order.deleteMany({ user: item._id });

      // Delete the user
      await this.Model.findByIdAndDelete(req.params.id);

      req.flash(
        "success",
        `${this.title} and associated orders deleted successfully.`
      );
      return res.redirect(`/${this.route}`);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new UserController();
