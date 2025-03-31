const Product = require("../../models/Product");
const ProductCategory = require("../../models/ProductCategory");

class ProductController {
    async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 6; // Products per page
            const skip = (page - 1) * limit;
            const categoryName = req.query.category || "";  // Default to empty string
            const priceRange = req.query.price || "";  // Default to empty string

            let filter = {};

            // Get category ID by name if a category name is provided
            if (categoryName && categoryName !== "all") {
                const category = await ProductCategory.findOne({ name: categoryName });
                if (category) {
                    filter.category = category._id;
                }
            }

            // Price Range Filter
            if (priceRange && priceRange !== "all") {
                const [min, max] = priceRange === "2000+" ? [2000, Infinity] : priceRange.split("-").map(Number);
                filter.price = { $gte: min, $lte: max };
            }

            // Fetch filtered products
            const products = await Product.find(filter).populate('category').skip(skip).limit(limit);
            const totalProducts = await Product.countDocuments(filter);
            const totalPages = Math.ceil(totalProducts / limit);

            // Fetch all categories for the filter dropdown
            const categories = await ProductCategory.find();

            // Group products by category for display
            const groupedProducts = {};
            products.forEach(product => {
                const categoryName = product.category.name;
                if (!groupedProducts[categoryName]) {
                    groupedProducts[categoryName] = [];
                }
                groupedProducts[categoryName].push(product);
            });

            // Render the page with products, categories, pagination, and filters
            res.render('front/products', {
                groupedProducts,
                categories,
                totalPages,
                currentPage: page,
                categoryFilter: categoryName, // Pass categoryFilter to the view as the category name
                priceFilter: priceRange // Pass priceFilter to the view
            });
        } catch (err) {
            res.status(500).send('Error retrieving products');
        }
    }

    async getProductDetails(req, res) {
        try {
            const productId = req.query.id; // Get product ID from query parameter
            const product = await Product.findById(productId).populate("category");

            if (!product) {
                return res.status(404).send("Product not found");
            }

            res.render("front/product-details", { product });
        } catch (err) {
            res.status(500).send("Error retrieving product details");
        }
    }
}

module.exports = new ProductController();
