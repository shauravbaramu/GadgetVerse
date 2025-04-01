const Product = require("../../models/Product");
const ProductCategory = require("../../models/ProductCategory");

class ProductController {
    async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 6; // Products per page
            const skip = (page - 1) * limit;
            const categoryName = req.query.category || "all";
            const priceRange = req.query.price || "all";
            const searchQuery = req.query.search || "";
    
            let filter = {};
    
            // Filter by category
            if (categoryName !== "all") {
                const category = await ProductCategory.findOne({ name: categoryName });
                if (category) {
                    filter.category = category._id;
                }
            }
    
            // Filter by price range
            if (priceRange !== "all") {
                const [min, max] = priceRange === "2000+" ? [2000, Infinity] : priceRange.split("-").map(Number);
                filter.price = { $gte: min, $lte: max };
            }
    
            // Filter by search query
            if (searchQuery) {
                filter.name = { $regex: searchQuery, $options: "i" }; // Case-insensitive search
            }
    
            // Fetch filtered products
            const products = await Product.find(filter).populate("category").skip(skip).limit(limit);
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
            res.render("front/products", {
                groupedProducts,
                categories,
                totalPages,
                currentPage: page,
                categoryFilter: categoryName,
                priceFilter: priceRange,
                searchQuery // Pass the search query to the frontend
            });
        } catch (err) {
            res.status(500).send("Error retrieving products");
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

    // Method to handle search query
    async searchProducts(req, res) {
        try {
            const searchQuery = req.query.query?.trim() || ""; // Get the search query
            const categoryName = req.query.category || "all"; // Get the category filter
            const priceRange = req.query.price || "all"; // Get the price range filter
    
            let filter = {};
    
            // Filter by category
            if (categoryName !== "all") {
                const category = await ProductCategory.findOne({ name: categoryName });
                if (category) {
                    filter.category = category._id;
                }
            }
    
            // Filter by price range
            if (priceRange !== "all") {
                const [min, max] = priceRange === "2000+" ? [2000, Infinity] : priceRange.split("-").map(Number);
                filter.price = { $gte: min, $lte: max };
            }
    
            // Filter by search query
            if (searchQuery) {
                filter.name = { $regex: searchQuery, $options: "i" }; // Case-insensitive search
            }
    
            // Fetch products that match the filters
            const products = await Product.find(filter).populate("category").limit(10); // Limit results to 10
    
            // Return the filtered products as a JSON response
            res.json(products);
        } catch (err) {
            console.error("Error fetching search results:", err);
            res.status(500).json({ error: "Failed to fetch search results" });
        }
    }
}

module.exports = new ProductController();
