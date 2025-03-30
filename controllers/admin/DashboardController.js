const User = require('../../models/User');
const productCategory = require('../../models/ProductCategory');

class DashboardController {
    async index(req, res) {
        let data = {};
        data['users'] = await User.find().countDocuments();
        data['productCategories'] = await productCategory.find().countDocuments();
        res.render('admin/dashboard', { data });
    }
}

module.exports = new DashboardController();