const BaseController = require("./BaseController");
const Contact = require("../../models/ContactUs");
const path = require("path");
const ejs = require("ejs");

class ContactUsController extends BaseController {
  constructor() {
    super(Contact, {
      title: "Contact us",
      subTitle: "Manage Contact Messages",
      resources: "admin::contacts.",
      route: "admin/contacts/",
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
                { name: { $regex: searchValue, $options: "i" } },
                { email: { $regex: searchValue, $options: "i" } },
              ],
            }
          : {};
  
        // Get total records and filtered records
        const totalRecords = await this.Model.countDocuments();
        const filteredRecords = await this.Model.countDocuments(query);
  
        // Fetch the filtered data with pagination
        const items = await this.Model.find(query)
          .skip(start)
          .limit(length)
          .lean();
  
        // Format the data for DataTables
        const data = await Promise.all(
          items.map(async (item, index) => {
            const actionPartialPath = path.join(
              __dirname,
              "../../views/admin/contacts/index_actions.ejs"
            );
            const actionHtml = await ejs.renderFile(actionPartialPath, { item });
  
            return {
              id: item._id,
              DT_RowIndex: start + index + 1,
              name: item.name,
              email: item.email,
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
        const items = await this.Model.find();
        let crudInfo = this.crudInfo();
        const success = req.flash("success");
        return res.render(`${this.route}index`, { crudInfo, items, success });
      }
    } catch (err) {
      console.error("Error in index method:", err);
      return res.status(500).send(err.message);
    }
  }

  async show(req, res) {
    try {
      const item = await this.Model.findById(req.params.id);
      if (!item) return res.status(404).send("Not found");
      let crudInfo = this.crudInfo();
      crudInfo.item = item;
      return res.render(`${this.route}show`, { crudInfo, item });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  async delete(req, res) {
    try {
      const item = await this.Model.findById(req.params.id);
      if (!item) return res.status(404).send("Not found");
      await this.Model.findByIdAndDelete(req.params.id);
      req.flash("success", `${this.title} deleted successfully.`);
      return res.redirect(`/${this.route}`);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new ContactUsController();
