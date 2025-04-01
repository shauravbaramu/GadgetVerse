const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const BaseController = require("./BaseController");
const Product = require("../../models/Product");
const ProductCategory = require("../../models/ProductCategory");
const Order = require("../../models/Order"); // Ensure Order is imported for delete logic

class ProductController extends BaseController {
  constructor() {
    super(Product, {
      title: "Product",
      subTitle: "Manage Products",
      resources: "admin::products.",
      route: "admin/products/",
    });
  }

  async index(req, res) {
    try {
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        const items = await this.Model.find().populate("category").lean();
        const data = await Promise.all(
          items.map(async (item, index) => {
            const imageHtml = item.image
              ? `<a href="${item.image}" target="blank"><img src="${item.image}" alt="Product Image" style="width:80px; height:80px; object-fit: cover;"></a>`
              : `<a href="/admin/img/placeholder.png" target="blank"><img src="/admin/img/placeholder.png" alt="Product Image" style="width:80px; height:80px; object-fit: cover;"></a>`;

            const categoryHtml = item.category
              ? `<a href="/admin/productCategories/show/${item.category._id}" target="blank">${item.category.name}</a>`
              : "N/A";

              const isFeaturedHtml = item.isFeatured
              ? `<span class="badge badge-success">Yes</span>`
              : `<span class="badge badge-danger">No</span>`;

            const actionPartialPath = path.join(
              __dirname,
              "../../views/admin/products/index_actions.ejs"
            );
            const actionHtml = await ejs.renderFile(actionPartialPath, {
              item,
            });

            return {
              id: item._id,
              DT_RowIndex: index + 1,
              category: categoryHtml,
              name: item.name,
              price: item.price,
              stock: item.stock,
              sku: item.sku,
              isFeatured: isFeaturedHtml,
              image: imageHtml,
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
          success: req.flash("success"),
        });
      }
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  async create(req, res) {
    let crudInfo = this.crudInfo();
    crudInfo.routeName = "Create";
    try {
      const categories = await ProductCategory.find().lean();
      return res.render(`${this.route}create`, {
        crudInfo,
        errors: req.flash("errors"),
        categories,
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  async store(req, res) {
    let errors = [];
    if (!req.body.name || req.body.name.trim() === "") {
      errors.push({ msg: "Product name is required" });
    }
    if (!req.body.price || isNaN(req.body.price)) {
      errors.push({ msg: "Valid price is required" });
    }
    if (!req.body.category) {
      errors.push({ msg: "Category is required" });
    }

    if (errors.length > 0) {
      return res.render(`${this.route}create`, {
        crudInfo: this.crudInfo(),
        errors,
        item: req.body,
        categories: req.categories || [],
      });
    }
    try {
      if (req.file) {
        req.body.image = `/uploads/products/${req.file.filename}`;
      }
      req.body.isFeatured = req.body.isFeatured === "on"; // Convert checkbox value to boolean
      const item = new this.Model(req.body);
      await item.save();
      req.flash("success", `${this.title} created successfully.`);
      return res.redirect(`/${this.route}`);
    } catch (err) {
      errors.push({ msg: err.message });
      return res.render(`${this.route}create`, {
        crudInfo: this.crudInfo(),
        errors,
        item: req.body,
        categories: req.categories || [],
      });
    }
  }

  async edit(req, res) {
    try {
      const item = await this.Model.findById(req.params.id).populate("category");
      if (!item) return res.status(404).send("Not found");
      const categories = await ProductCategory.find().lean();
      let crudInfo = this.crudInfo();
      crudInfo.item = item;
      crudInfo.routeName = "Edit";
      return res.render(`${this.route}edit`, {
        crudInfo,
        item,
        errors: req.flash("errors"),
        categories: categories || [],
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  async update(req, res) {
    let errors = [];
    if (!req.body.name || req.body.name.trim() === "") {
      errors.push({ msg: "Product name is required" });
    }
    if (!req.body.price || isNaN(req.body.price)) {
      errors.push({ msg: "Valid price is required" });
    }
    if (!req.body.category) {
      errors.push({ msg: "Category is required" });
    }

    if (errors.length > 0) {
      return res.render(`${this.route}edit`, {
        crudInfo: this.crudInfo(),
        errors,
        item: req.body,
      });
    }
    try {
      const oldItem = await this.Model.findById(req.params.id);
      if (!oldItem) return res.status(404).send("Not found");

      if (req.file) {
        if (oldItem.image) {
          const oldFilePath = path.join(__dirname, "../../", oldItem.image);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        req.body.image = `/uploads/products/${req.file.filename}`;
      } else {
        req.body.image = oldItem.image;
      }

      req.body.isFeatured = req.body.isFeatured === "on"; // Convert checkbox value to boolean
      const item = await this.Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      req.flash("success", `${this.title} updated successfully.`);
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
}

module.exports = new ProductController();