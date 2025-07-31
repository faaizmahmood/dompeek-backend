const User = require('../../models/user');

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id; // Set by auth middleware (JWT decoded)

        const user = await User.findById(userId).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                apiCount: user.apiCount,
                lastAccess: user.lastAccess,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                verified: user.verified,
                recentSearches: user.recentSearches
            },
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getUserProfile };
