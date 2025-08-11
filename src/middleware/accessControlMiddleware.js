// middleware/accessControlMiddleware.js
const IPModel = require('../models/ipLimit');
const UserModel = require('../models/user');
const { verifyUser } = require('../utils/jwt');

const MAX_LIMIT_IP = 3;
const MAX_LIMIT_USER = 1000;

const getToday = () => new Date().toISOString().slice(0, 10);
const getClientIP = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;

const accessControlMiddleware = async (req, res, next) => {
    const today = getToday();
    const domain = req.query?.domain || req.params?.domain || req.body?.domain || null;

    if (!domain) {
        return res.status(400).json({ message: 'Domain not provided for logging.' });
    }

    // ✅ JWT verification
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token && token !== 'null' && token !== 'undefined') {
        try {
            const user = verifyUser(token);
            req.user = user;

            // ✅ Logged-in user limit
            const userDoc = await UserModel.findById(user.id);
            if (!userDoc) return res.status(401).json({ message: 'Invalid user.' });

            if (userDoc.lastAccess !== today) {
                userDoc.apiCount = 1;
                userDoc.lastAccess = today;
            } else if (userDoc.apiCount >= MAX_LIMIT_USER) {
                return res.status(429).json({ message: 'Daily API limit reached for your account.' });
            } else {
                userDoc.apiCount += 1;
            }

            // 👉 Save recent searches
            userDoc.recentSearches ||= [];
            userDoc.recentSearches.unshift({ domain, timestamp: new Date() });
            if (userDoc.recentSearches.length > 10) {
                userDoc.recentSearches = userDoc.recentSearches.slice(0, 10);
            }

            await userDoc.save();
            return next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Forbidden: Token expired' });
            }
            return res.status(401).json({ message: 'Unauthorized: Token is invalid' });
        }
    }

    // ✅ Guest (IP-based)
    const ip = getClientIP(req);
    let record = await IPModel.findOne({ ip });

    if (!record) {
        await IPModel.create({
            ip,
            count: 1,
            lastAccess: today,
            searches: [{ domain, timestamp: new Date() }]
        });
        return next();
    }

    if (record.lastAccess !== today) {
        record.count = 1;
        record.lastAccess = today;
        record.searches = [{ domain, timestamp: new Date() }];
    } else if (record.count >= MAX_LIMIT_IP) {
        return res.status(429).json({ message: 'Free usage limit reached. Please sign up for more access.' });
    } else {
        record.count += 1;
        record.searches ||= [];
        record.searches.unshift({ domain, timestamp: new Date() });
        if (record.searches.length > 10) {
            record.searches = record.searches.slice(0, 10);
        }
    }

    await record.save();
    next();
};

module.exports = accessControlMiddleware;
