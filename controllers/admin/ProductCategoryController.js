// controllers/ProductCategoryController.js
const BaseController = require("./BaseController");
const ProductCategory = require("../../models/ProductCategory");
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

class ProductCategoryController extends BaseController {
  constructor() {
    super(ProductCategory, {
      title: "Product Category",
      subTitle: "Manage Product Categories",
      resources: "admin::productCategories.",
      route: "admin/productCategories/",
    });
  }

  async index(req, res) {
    try {
      // Check if the request is AJAX (DataTables expects JSON)
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        // Fetch all items; use .lean() for plain objects
        const items = await this.Model.find().lean();
  
        // Process each item to include rendered HTML for image and actions
        const data = await Promise.all(
          items.map(async (item, index) => {
            // Create HTML for image column
            const imageHtml = item.image
              ? `<a href="${item.image}" target="blank"><img src="${item.image}" alt="Category Image" style="width:80px; height:80px; object-fit: cover;"></a>`
              : `<a href="/admin/img/placeholder.png" target="blank"><img src="/admin/img/placeholder.png" alt="Category Image" style="width:80px; height:80px; object-fit: cover;"></a>`;
            
            // Adjust the path to index_actions.ejs:
            const actionPartialPath = path.join(
              __dirname,
              "../../views/admin/productCategories/index_actions.ejs"
            );
            const actionHtml = await ejs.renderFile(actionPartialPath, { item });
  
            return {
              id: item._id,
              DT_RowIndex: index + 1,
              name: item.name,
              image: imageHtml,
              action: actionHtml,
            };
          })
        );
  
        return res.json({ data });
      } else {
        // Regular page load: render the view
        const items = await this.Model.find();
        let crudInfo = this.crudInfo();
        const success = req.flash("success");
        return res.render(`${this.route}index`, { crudInfo, items, success});
      }
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
  

  create(req, res) {
    let crudInfo = this.crudInfo();
    crudInfo.routeName = "Create";
    return res.render(`${this.route}create`, {
      crudInfo,
      errors: req.flash("errors")
    });
  }

  // Store a new product category (manual validation)
  async store(req, res) {
    // Debugging logs:
    console.log("Store method req.body:", req.body);
    console.log("Store method req.file:", req.file);
  
    let errors = [];
    if (!req.body.name || req.body.name.trim() === "") {
      errors.push({ msg: "Category name is required" });
    }
  
    if (errors.length > 0) {
      return res.render(`${this.route}create`, {
        crudInfo: this.crudInfo(),
        errors,
        item: req.body
      });
    }
    try {
      // If a file was uploaded, assign the file path
      if (req.file) {
        req.body.image = `/uploads/productCategory/${req.file.filename}`;
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
        item: req.body
      });
    }
  }
  

  // Display a single product category
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

  // Show form for editing a product category
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
        errors: req.flash("errors")
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  // Update a product category (manual validation, remove old file if new one is uploaded)
  async update(req, res) {
    let errors = [];
    if (!req.body.name || req.body.name.trim() === "") {
      errors.push({ msg: "Category name is required" });
    }
    if (errors.length > 0) {
      return res.render(`${this.route}edit`, {
        crudInfo: this.crudInfo(),
        errors,
        item: req.body
      });
    }
    try {
      // Get the existing document first
      const oldItem = await this.Model.findById(req.params.id);
      if (!oldItem) return res.status(404).send("Not found");

      // If a new file is uploaded, remove the old file (if exists) and update the image field.
      if (req.file) {
        if (oldItem.image) {
          // Construct the absolute path to the old file.
          const oldFilePath = path.join(__dirname, '../../', oldItem.image);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        // Set the new image path (adjust according to your file serving configuration)
        req.body.image = `/uploads/productCategory/${req.file.filename}`;
      } else {
        // If no new file was uploaded, optionally ensure we don't overwrite the image field
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
        item: req.body
      });
    }
  }

  // Delete a product category (and remove associated file)
  async delete(req, res) {
    try {
      // Retrieve the document so we know if it has an image.
      const item = await this.Model.findById(req.params.id);
      if (!item) return res.status(404).send("Not found");

      // If there is an associated image, remove the file.
      if (item.image) {
        const filePath = path.join(__dirname, '../../', item.image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await Product.deleteMany({ user: item._id });

      await this.Model.findByIdAndDelete(req.params.id);
      req.flash("success", `${this.title} deleted successfully.`);
      return res.redirect(`/${this.route}`);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new ProductCategoryController();
