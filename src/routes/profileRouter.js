const express = require('express')
const router = express.Router()
const { getUserProfile } = require('../controllers/profileController/profile')
const userMiddleware = require('../middleware/userMiddleware')


router.get('/profile', userMiddleware, getUserProfile);

module.exports = router;