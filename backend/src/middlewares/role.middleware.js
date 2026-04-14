const { ROLES } = require('../config/roles');

const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Access denied',
                message: `This endpoint requires one of: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = { authorize };
