const express = require('express');
const router = express.Router();
const { signupUser } = require('../controllers/authController/signupController');
const { signinUser } = require('../controllers/authController/signinController');

router.post('/signup', signupUser);
router.post('/signin', signinUser);

module.exports = router;
