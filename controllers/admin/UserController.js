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

  async index(req, res) {
    try {
      // If the request is AJAX, return JSON for DataTables
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        const items = await this.Model.find().lean();
        
        // Process each item to include rendered action HTML
        const data = await Promise.all(items.map(async (item, index) => {
          // Render the index_actions partial for each item
          const actionHtml = await ejs.renderFile(
            path.join(__dirname, '../views/admin/users/index_actions.ejs'),
            { item }
          );
          return {
            id: item._id,
            DT_RowIndex: index + 1,
            first_name: item.first_name,
            email: item.email,
            phone: item.phone,
            address: item.address,
            action: actionHtml
          };
        }));
        
        return res.json({ data });
      } else {
        // Otherwise, render the normal view
        const items = await this.Model.find();
        let crudInfo = this.crudInfo();
        return res.render(`${this.route}index`, { crudInfo, items, hideCreate: true });
      }
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
}

module.exports = new UserController();
