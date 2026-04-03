/**
 * checkRole middleware factory.
 * Usage: checkRole(['Admin', 'Manager'])
 * Reads role from the JWT payload already set by auth.js
 */
const checkRole = (allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: `Access denied. Required roles: ${allowedRoles.join(', ')}` });
    }
    next();
};

module.exports = checkRole;
