const express = require('express');
const router = express.Router();

const { getAIInsights } = require('../controllers/aiInsightsController/aiInsights')

router.post('/ai-summary', getAIInsights)

module.exports = router