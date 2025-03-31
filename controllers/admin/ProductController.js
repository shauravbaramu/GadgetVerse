const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const BaseController = require("./BaseController");
const Product = require("../../models/Product");
const ProductCategory = require("../../models/ProductCategory");

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
      // Check if the request is AJAX (DataTables expects JSON)
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        // Fetch all products, populating the category field; use .lean() for plain objects
        const items = await this.Model.find().populate("category").lean();

        // Process each item to include rendered HTML for image, category, and actions
        const data = await Promise.all(
          items.map(async (item, index) => {
            // Create HTML for image column (adjust styling as needed)
            const imageHtml = item.image
              ? `<a href="${item.image}" target="blank"><img src="${item.image}" alt="Category Image" style="width:80px; height:80px; object-fit: cover;"></a>`
              : `<a href="/admin/img/placeholder.png" target="blank"><img src="/admin/img/placeholder.png" alt="Category Image" style="width:80px; height:80px; object-fit: cover;"></a>`;

            // Create HTML for the category field, showing both name and id if available
            const categoryHtml = item.category
              ? `<a href="/admin/productCategories/show/${item.category._id}" target="blank" style:"text-decoration: none">${item.category.name}</a>`
              : "N/A";

            // Adjust the path to index_actions.ejs:
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
              image: imageHtml,
              action: actionHtml,
            };
          })
        );

        return res.json({ data });
      } else {
        // For regular page load, render the view
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

  // Show form for creating a new product
  async create(req, res) {
    let crudInfo = this.crudInfo();
    crudInfo.routeName = "Create";
    try {
      // Fetch all product categories (adjust query as needed)
      const categories = await ProductCategory.find().lean();
      return res.render(`${this.route}create`, {
        crudInfo,
        errors: req.flash("errors"),
        categories, // Pass the categories to the view
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Store a new product with manual validation
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
    // Additional validations can be added here.

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

  // Display a single product
  async show(req, res) {
    try {
      // Populate category to show its name in the show view
      const item = await this.Model.findById(req.params.id).populate(
        "category"
      );
      if (!item) return res.status(404).send("Not found");
      let crudInfo = this.crudInfo();
      crudInfo.item = item;
      return res.render(`${this.route}show`, { crudInfo, item });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Show form for editing a product
  async edit(req, res) {
    try {
      // Populate category so that we can pre-select the current category
      const item = await this.Model.findById(req.params.id).populate(
        "category"
      );
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

  // Update an existing product
  async update(req, res) {
    let errors = [];
    // Manual validation
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
      // Retrieve the current product so we can check the old image
      const oldItem = await this.Model.findById(req.params.id);
      if (!oldItem) return res.status(404).send("Not found");

      // If a new file is uploaded, remove the old image (if exists) and update the field
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

  // Delete a product
  async delete(req, res) {
    try {
      const item = await this.Model.findById(req.params.id);
      if (!item) return res.status(404).send("Not found");

      // If there's an associated image, remove it
      if (item.image) {
        const filePath = path.join(__dirname, "../../", item.image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete associated order items
      await Order.updateMany(
        { "items.product": item._id }, // Find orders containing this product
        { $pull: { items: { product: item._id } } } // Remove the product from the items array
      );

      await this.Model.findByIdAndDelete(req.params.id);
      req.flash("success", `${this.title} deleted successfully.`);
      return res.redirect(`/${this.route}`);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new ProductController();
