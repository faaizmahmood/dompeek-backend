const User = require('../../models/user');
const { setUser } = require('../../utils/jwt');
const bcrypt = require('bcrypt');

const signinUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email." });
        }

        // Match entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const tokenPayload = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        const token = setUser(tokenPayload);

        res.status(200).json({
            message: "Login successful.",
            authToken: token,
            userId: user._id,
        });

    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = { signinUser };
