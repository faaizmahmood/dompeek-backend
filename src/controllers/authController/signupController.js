const User = require('../../models//user');
const { setUser } = require('../../utils/jwt');

const signupUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        const user = new User({
            name,
            email,
            passwordHash: password, // hashed automatically in model pre-save
        });

        await user.save();

        const tokenPayload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        const token = setUser(tokenPayload);

        res.status(201).json({
            message: "User registered successfully.",
            authToken: token,
            userId: user._id
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = { signupUser };
