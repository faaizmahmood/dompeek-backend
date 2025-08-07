// routes/domainToolsRoutes.js
const express = require('express');
const { domainOverview } = require('../controllers/overviewController/overview');
const getSuggestions = require('../controllers/overviewController/getAlternativeDomain');
const accessControlMiddleware = require('../middleware/accessControlMiddleware');

const router = express.Router();
router.get("/overview", accessControlMiddleware, domainOverview);
router.get("/get-suggestions", getSuggestions);

module.exports = router;
