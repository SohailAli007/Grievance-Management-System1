const { verifyToken } = require('../../Shared/jwt');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = verifyToken(token);
            req.user = decoded; // Attach user info to request
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Authentication error' });
    }
};

module.exports = { authenticate };
