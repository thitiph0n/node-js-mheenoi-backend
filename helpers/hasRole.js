function hasRole(role) {
  return function (req, res, next) {
    if (role.indexOf(parseInt(req.authData.role)) === -1) {
      res.status(403).json({
        error: { message: "you don't have permission to access this page" },
      });
    } else next();
  };
}

module.exports = hasRole;
