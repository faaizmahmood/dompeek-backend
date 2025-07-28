const User = require('../../models/companyModel');
const { setUser } = require('../../utils/jwt');
const bcrypt = require('bcrypt');

const signinCompany = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
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
            slug: user.slug
        });

    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = { signinCompany };
