const NodeCache = require("node-cache");
const aiCache = new NodeCache({ stdTTL: 600 });

const { getDomainAISummary } = require('../../services/aiSummary');
const { getDomainHistorySeo } = require('../../services/history_seoService');
const { getDomainTrustRiskCompetitive } = require('../../services/TrustRisk_Competitive');
const { getDomainBuyerMatchDomainLiquidity } = require('../../services/buyerMatch_domainLiquidity');
const { getDomainAIRecommendations } = require('../../services/airecommendations');

const getAIInsights = async (req, res) => {
    try {
        const { domainData } = req.body;


        if (!domainData) {
            return res.status(400).json({ error: 'domainData is required in request body' });
        }

        const domainKey = domainData?.whois?.domainName?.toLowerCase() || null;

        // const domainKey = domainData?.domain?.toLowerCase();
        if (!domainKey) {
            return res.status(400).json({ error: 'domain name is missing inside domainData---' });
        }

        // ✅ Check cache first
        const cachedData = aiCache.get(domainKey);
        if (cachedData) {
            return res.json({
                domain: domainKey,
                fetchedAt: new Date(),
                cached: true,
                results: cachedData
            });
        }

        // ✅ Run AI calls in parallel
        const tasks = [
            { key: "summary", fn: () => getDomainAISummary(domainData) },
            { key: "historySeo", fn: () => getDomainHistorySeo(domainData) },
            { key: "trustRiskCompetitive", fn: () => getDomainTrustRiskCompetitive(domainData) },
            { key: "buyerMatchDomainLiquidity", fn: () => getDomainBuyerMatchDomainLiquidity(domainData) },
            { key: "aiRecommendations", fn: () => getDomainAIRecommendations(domainData) },
        ];

        const promises = tasks.map(async ({ key, fn }) => {
            try {
                const data = await fn();
                return { key, success: true, data };
            } catch (err) {
                console.error(`❌ Error in ${key}:`, err);
                return { key, success: false, error: err.message || "Unknown error" };
            }
        });

        const results = await Promise.all(promises);

        // ✅ Format response
        const response = {};
        results.forEach(result => {
            response[result.key] = result.success
                ? { success: true, data: result.data }
                : { success: false, error: result.error };
        });

        // ✅ Cache results
        aiCache.set(domainKey, response);

        return res.json({
            domain: domainKey,
            fetchedAt: new Date(),
            cached: false,
            results: response
        });

    } catch (err) {
        console.error('❌ Error in getAIInsightsController:', err);
        return res.status(500).json({
            error: 'Failed to process AI insights',
            details: err.message
        });
    }
};

module.exports = { getAIInsights };
