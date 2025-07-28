const express = require('express');
const router = express.Router();
const { signupCompany } = require('../controllers/authController/signupController');
const { signinCompany } = require('../controllers/authController/signinController');

router.post('/signup', signupCompany);
router.post('/signin', signinCompany);

module.exports = router;
