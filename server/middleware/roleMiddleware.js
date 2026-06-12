const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User context not established.',
      });
    }

    const { role_name } = req.user;

    if (!allowedRoles.includes(role_name)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access restricted to roles: [${allowedRoles.join(', ')}]. Current role: '${role_name}'`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
