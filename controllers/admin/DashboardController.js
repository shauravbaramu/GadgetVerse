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

        orders.forEach(order => {
            totalIncome += order.totalPrice; // Assuming totalPrice includes all charges
        });

        // Count orders by status
        const orderStatusCounts = {
            pending: await order.countDocuments({ status: 'pending' }),
            processing: await order.countDocuments({ status: 'processing' }),
            shipped: await order.countDocuments({ status: 'shipped' }),
            delivered: await order.countDocuments({ status: 'delivered' }),
            cancelled: await order.countDocuments({ status: 'cancelled' }),
        };

        // Monthly income and expenses
        const monthlyData = await order.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    monthlyIncome: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } } // Sort by month
        ]);

        const months = Array.from({ length: 12 }, (_, i) => i + 1); // Months 1 to 12
        const incomeByMonth = months.map(month => {
            const data = monthlyData.find(d => d._id === month);
            return data ? data.monthlyIncome : 0;
        });

        // Top Selling Product Categories
        const topCategories = await order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category", // Group by category
                    totalSold: { $sum: "$items.quantity" }
                }
            },
            {
                $lookup: {
                    from: "productcategories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            { $sort: { totalSold: -1 } }, // Sort by total sold
            { $limit: 5 } // Limit to top 5 categories
        ]);

        const categoryLabels = topCategories.map(c => c.categoryDetails.name);
        const categoryData = topCategories.map(c => c.totalSold);

        res.json({
            income: totalIncome,
            orderStatusCounts,
            monthlyIncome: incomeByMonth,
            topCategories: {
                labels: categoryLabels,
                data: categoryData
            }
        });
    }
}

module.exports = new DashboardController();
