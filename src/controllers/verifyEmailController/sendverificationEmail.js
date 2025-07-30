// routes/user.js or auth.js
const User = require('../../models/user')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'Gmail', // or another SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendVerificationEmail = async (req, res) => {

  const { domain } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ msg: 'User not found' });

  if (user.verified) return res.status(400).json({ msg: 'Already verified' });

  const token = jwt.sign({ userId: user._id }, process.env.EMAIL_SECRET, { expiresIn: '1h' });

  // Determine protocol
  const protocol = domain.includes('localhost') ? 'http' : 'https';

  const verifyUrl = `${protocol}://${domain}/verify-email/${token}`;
  const html = `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a></p>`;

  await transporter.sendMail({
    to: user.email,
    subject: 'Verify your email',
    html,
  });

  res.json({ msg: 'Verification email sent' });

}


module.exports = sendVerificationEmail