const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const dotenv = require('dotenv');
dotenv.config();

const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_SECRET); // same secret as email token

        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).send('User not found');

        if (user.verified) return res.status(200).send('Email already verified');


        user.verified = true;
        await user.save();

        return res.status(200).send('Email successfully verified');
    } catch (err) {
        console.error(err);
        return res.status(400).send('Invalid or expired verification link');
    }
};

module.exports = verifyEmail;
