const Product = require('../../models/Product');

class HomeController {
  async index(req, res) {
    try {
      // Fetch featured products from the database
      const featuredProducts = await Product.find({ isFeatured: true }).limit(10).lean();

      // Render the homepage and pass the featured products
      return res.render('front/index', {
        featuredProducts,
        user: req.session.user || null, // Pass user if logged in
      });
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new HomeController();