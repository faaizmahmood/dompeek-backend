const { getDomainAISummary } = require('../../services/aiSummary');

const getAISummaryController = async (req, res) => {
    try {
        // 1️⃣ Expect domainData in request body
        const { domainData } = req.body;

        if (!domainData) {
            return res.status(400).json({ error: 'domainData is required in request body' });
        }

        // 2️⃣ Call AI Summary Service
        const aiResult = await getDomainAISummary(domainData);

        // 3️⃣ Send back AI JSON response
        return res.status(200).json(aiResult);

    } catch (err) {
        console.error('❌ Error in getAISummaryController:', err);
        return res.status(500).json({
            error: 'Failed to process AI summary',
            details: err.message
        });
    }
};

module.exports = { getAISummaryController };
