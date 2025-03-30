const User = require('../../models/User');

class DashboardController {
    async index(req, res) {
        const users = await User.find().countDocuments();
        res.render('admin/dashboard', { users });
    }
}