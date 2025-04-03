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
                { first_name: { $regex: searchValue, $options: "i" } },
                { email: { $regex: searchValue, $options: "i" } },
                { phone: { $regex: searchValue, $options: "i" } },
                { address: { $regex: searchValue, $options: "i" } },
              ],
            }
          : {};
  
        // Get total records and filtered records
        const totalRecords = await this.Model.countDocuments({ role: "user" });
        const filteredRecords = await this.Model.countDocuments({
          role: "user",
          ...query,
        });
  
        // Fetch the filtered data with pagination
        const items = await this.Model.find({ role: "user", ...query })
          .skip(start)
          .limit(length)
          .lean();
  
        // Format the data for DataTables
        const data = await Promise.all(
          items.map(async (item, index) => {
            // Render the action buttons using the partial view
            const actionPartialPath = path.join(
              __dirname,
              "../../views/admin/users/index_actions.ejs"
            );
            const actionHtml = await ejs.renderFile(actionPartialPath, { item });
  
            return {
              id: item._id,
              DT_RowIndex: start + index + 1,
              first_name: item.first_name,
              email: item.email,
              phone: item.phone,
              address: item.address,
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
        const items = await this.Model.find({ role: "user" });
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
      console.error("Error in index method:", err);
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
      // await Order.deleteMany({ user: item._id });

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
