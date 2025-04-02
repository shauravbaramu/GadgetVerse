const User = require('../../models/User');
const productCategory = require('../../models/ProductCategory');
const product = require('../../models/Product');
const order = require('../../models/Order');

class DashboardController {
    async index(req, res) {
        let data = {};
        data['users'] = await User.find({ "role": "user" }).countDocuments();
        data['productCategories'] = await productCategory.find().countDocuments();
        data['products'] = await product.find().countDocuments();
        data['orders'] = await order.find().countDocuments();

        res.render('admin/dashboard', { data });
    }

    async getChartData(req, res) {
        // Calculate income and expenses
        const orders = await order.find();
        let totalIncome = 0;
        let totalExpenses = 0;

        orders.forEach(order => {
            totalIncome += order.totalPrice; // Assuming totalPrice includes all charges
            totalExpenses += order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0); // Cost of items
        });

        // Count orders by status
        const orderStatusCounts = {
            pending: await order.countDocuments({ status: 'pending' }),
            processing: await order.countDocuments({ status: 'processing' }),
            shipped: await order.countDocuments({ status: 'shipped' }),
            delivered: await order.countDocuments({ status: 'delivered' }),
            cancelled: await order.countDocuments({ status: 'cancelled' }),
        };

        res.json({
            income: totalIncome,
            expenses: totalExpenses,
            orderStatusCounts
        });
    }
}

module.exports = new DashboardController();