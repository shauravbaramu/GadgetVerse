// controllers/UserController.js
const BaseController = require('./BaseController');
const User = require('../../models/User');

class UserController extends BaseController {
  constructor() {
    super(User, {
      title: 'User',
      subTitle: 'Manage Users',
      resources: 'admin::users.',
      route: 'admin/users/'
    });
  }
}

module.exports = new UserController();
