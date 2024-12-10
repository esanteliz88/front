const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash("errorMessage", "Debes iniciar sesión para acceder a esta página.");
    return res.redirect("/login");
  }
  next();
};

export default requireAuth;
