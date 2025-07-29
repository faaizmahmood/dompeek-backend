const { verifyUser } = require('../utils/jwt');

const userMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Case 1: No Authorization header → guest
    if (!authHeader) {
        return next();
    }

    // Case 2: Malformed header (not Bearer) → guest
    if (!authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    // Case 3: Token is empty, 'null', or 'undefined' → guest
    if (!token || token === 'null' || token === 'undefined' || token === '') {
        return next();
    }

    // Case 4: Attempt to verify token
    try {
        const user = verifyUser(token);
        req.user = user; // ✅ Authenticated user
        return next();
    } catch (error) {
        // ❌ Explicitly invalid or expired token
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Forbidden: Token expired' });
        }

        return res.status(401).json({ message: 'Unauthorized: Token is invalid' });
    }
};

module.exports = userMiddleware;
