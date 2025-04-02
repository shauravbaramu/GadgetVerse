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
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        const items = await this.Model.find().lean();
        const data = await Promise.all(
          items.map(async (item, index) => {
            const actionPartialPath = path.join(
              __dirname,
              "../../views/admin/contacts/index_actions.ejs"
            );
            const actionHtml = await ejs.renderFile(actionPartialPath, {
              item,
            });

            return {
              id: item._id,
              DT_RowIndex: index + 1,
              name: item.name,
              email: item.email,
              createdAt: new Date(item.createdAt).toLocaleString(),
              action: actionHtml,
            };
          })
        );
        return res.json({ data });
      } else {
        const items = await this.Model.find();
        let crudInfo = this.crudInfo();
        const success = req.flash("success");
        return res.render(`${this.route}index`, { crudInfo, items, success });
      }
    } catch (err) {
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
