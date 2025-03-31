const User = require('../../models/User');
const productCategory = require('../../models/ProductCategory');
const product = require('../../models/Product');
const order = require('../../models/Order');

class DashboardController {
    async index(req, res) {
        let data = {};
        data['users'] = await User.find({"role": "user"}).countDocuments();
        data['productCategories'] = await productCategory.find().countDocuments();
        data['products'] = await product.find().countDocuments();
        data['orders'] = await order.find().countDocuments();
        res.render('admin/dashboard', { data });
    }
}

module.exports = new DashboardController();