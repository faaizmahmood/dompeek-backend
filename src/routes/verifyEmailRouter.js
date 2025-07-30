const express = require('express')
const router = express.Router()
const sendVerificationEmail = require('../controllers/verifyEmailController/sendverificationEmail')
const verifyEmail = require('../controllers/verifyEmailController/verifyEmail')
const userMiddleware = require('../middleware/userLimitMiddleware')


router.post('/send-verification-email', userMiddleware, sendVerificationEmail);
router.get('/verify-email/:token', userMiddleware, verifyEmail);

module.exports = router;