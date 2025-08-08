const express = require('express');
const router = express.Router();

const { getAISummaryController } = require('../controllers/aiInsightsController/aiSummary')

router.post('/ai-summary', getAISummaryController)

module.exports = router