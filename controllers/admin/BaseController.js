// controllers/BaseController.js
class BaseController {
  /**
   * @param {Object} Model - The Mongoose model to work with.
   * @param {Object} options - Options for CRUD configuration.
   *        Expected keys: title, subTitle, resources, icon, route
   */
  constructor(Model, options = {}) {
    this.Model = Model;
    this.title = options.title || "";
    this.subTitle = options.subTitle || "";
    this.icon = options.icon || "flaticon2-user";
    // The "resources" string is used for view names (e.g., "admin::users.")
    this.resources = options.resources || "";
    // If route is not passed, default to title lowercased plus a trailing slash.
    this.route =
      options.route || (this.title ? this.title.toLowerCase() + "/" : "");
    this.success = { status: true };
    this.error = { status: false };
  }

  // Build a crudInfo object to pass to views.
  crudInfo() {
    return {
      title: this.title,
      subTitle: this.subTitle,
      route: this.route,
      icon: this.icon,
      item: {},
    };
  }

  // List all items
  async index(req, res) {
    try {
      const items = await this.Model.find();
      let crudInfo = this.crudInfo();
      // Use the configured route for view path instead of title.toLowerCase()
      return res.render(`${this.route}index`, {
        crudInfo,
        items,
        success: req.flash("success"),
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Store a new item in the database
  async store(req, res) {
    // const { validationResult } = require("express-validator");
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   req.flash("errors", errors.array());
    //   return res.render(`${this.route}create`, { crudInfo: this.crudInfo(), errors: errors.array(), old: req.body });
    // }
    try {
      const item = new this.Model(req.body);
      await item.save();
      req.flash("success", `${this.title} created successfully.`);
      return res.redirect(`/${this.title.toLowerCase()}`);
    } catch (err) {
      req.flash("errors", [{ msg: err.message }]);
      return res.redirect(`/${this.route}index`);
    }
  }

  // Display a single item
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

  // Show form for editing an item
  async edit(req, res) {
    try {
      const item = await this.Model.findById(req.params.id);
      if (!item) return res.status(404).send("Not found");
      let crudInfo = this.crudInfo();
      crudInfo.item = item;
      crudInfo.routeName = "Edit";
      return res.render(`${this.route}edit`, {
        crudInfo,
        item,
        errors: req.flash("errors"),
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Update an item
  async update(req, res) {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("errors", errors.array());
      return res.redirect(`/${this.route}edit/${req.params.id}`);
    }
    try {
      const item = await this.Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) return res.status(404).send("Not found");
      req.flash("success", `${this.title} updated successfully.`);
      return res.redirect(`/${this.title.toLowerCase()}`);
    } catch (err) {
      req.flash("errors", [{ msg: err.message }]);
      return res.redirect(`/${this.route}index`);
    }
  }

  // Delete an item
  async delete(req, res) {
    try {
      await this.Model.findByIdAndDelete(req.params.id);
      req.flash("success", `${this.title} deleted successfully.`);
      return res.redirect(`/${this.title.toLowerCase()}`);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = BaseController;
