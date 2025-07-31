const IPModel = require('../models/ipLimit');
const UserModel = require('../models/user');

const MAX_LIMIT_IP = 3;
const MAX_LIMIT_USER = 10;

const getToday = () => new Date().toISOString().slice(0, 10);
const getClientIP = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;

const rateLimiter = async (req, res, next) => {
    const today = getToday();
    const domain = req.query?.domain || req.params?.domain || req.body?.domain || null;

    if (!domain) {
        return res.status(400).json({ message: 'Domain not provided for logging.' });
    }

    if (req.user && req.user.id) {
        // Logged-in user
        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(401).json({ message: 'Invalid user.' });

        if (user.lastAccess !== today) {
            user.apiCount = 1;
            user.lastAccess = today;
        } else if (user.apiCount >= MAX_LIMIT_USER) {
            return res.status(429).json({ message: 'Daily API limit reached for your account.' });
        } else {
            user.apiCount += 1;
        }

        // 👉 Add recent search (limit to 10)
        user.recentSearches.unshift({ domain, timestamp: new Date() });
        if (user.recentSearches.length > 10) {
            user.recentSearches = user.recentSearches.slice(0, 10);
        }

        await user.save();
        return next();
    }

    // Guest user (by IP)
    const ip = getClientIP(req);
    let record = await IPModel.findOne({ ip });

    if (!record) {
        await IPModel.create({
            ip,
            count: 1,
            lastAccess: today,
            searches: [{ domain, timestamp: new Date() }] // 👈 Add search log
        });
        return next();
    }

    if (record.lastAccess !== today) {
        record.count = 1;
        record.lastAccess = today;
        record.searches = [{ domain, timestamp: new Date() }]; // 👈 Reset with new search
    } else if (record.count >= MAX_LIMIT_IP) {
        return res.status(429).json({ message: 'Free usage limit reached. Please sign up for more access.' });
    } else {
        record.count += 1;
        record.searches = record.searches || [];
        record.searches.unshift({ domain, timestamp: new Date() });

        if (record.searches.length > 10) {
            record.searches = record.searches.slice(0, 10); // optional limit
        }
    }

    await record.save();
    next();
};

module.exports = rateLimiter;
