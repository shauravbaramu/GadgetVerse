module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
      req.user = req.session.user; // Populate req.user with session data
      return next();
    }
    req.flash("errors", [{ msg: "Please log in to access this page" }]);
    return res.redirect("/admin/login");
  },
};