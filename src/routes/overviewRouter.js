// routes/domainToolsRoutes.js
const express = require('express');
const { domainOverview } = require('../controllers/overviewController/overview');
const accessControlMiddleware = require('../middleware/accessControlMiddleware');

const router = express.Router();
router.get("/overview", accessControlMiddleware, domainOverview);

module.exports = router;
