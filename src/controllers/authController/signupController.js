const User = require('../../models/companyModel');
const { setUser } = require('../../utils/jwt');
const slugify = require('slugify');

const signupCompany = async (req, res) => {
    const { companyName, fullName, email, password, phone } = req.body;

    if (!companyName || !email || !password || !fullName || !phone) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Company already exists." });
        }

        // Generate initial slug
        let baseSlug = slugify(companyName, { lower: true, strict: true });
        let slug = baseSlug;
        let suffix = 1;

        // Check for slug uniqueness
        while (await User.findOne({ slug })) {
            slug = `${baseSlug}-${suffix}`;
            suffix++;
        }

        const userPayload = {
            companyName,
            name: fullName,
            email,
            password,
            phone,
            slug,
            verified: false,
        };

        const user = new User(userPayload);
        await user.save();

        const tokenPayload = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        const token = setUser(tokenPayload);

        res.status(201).json({
            message: "Company registered successfully.",
            authToken: token,
            userId: user._id,
            slug: user.slug
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = { signupCompany };
