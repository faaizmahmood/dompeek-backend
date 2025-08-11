const NodeCache = require('node-cache');
const callOpenAI = require('../utils/openAiCall');

// ⏳ Cache for 6 hours (adjust as needed)
const aiCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const getDomainAIRecommendations = async (domainData) => {
    try {
        const domainName = domainData?.whois?.domainName || null;
        if (!domainName) throw new Error('Missing domain name in data');

        // 1️⃣ Check cache first
        const cached = aiCache.get(domainName);
        if (cached) {
            console.log(`📦 AI Recommendations cache hit for ${domainName}`);
            return cached;
        }

        // 2️⃣ Prepare cleaned & structured data for AI
        const analysisData = {
            domain: domainName,
            tld: domainData?.whois?.domainNameExt || null,
            age_years: getDomainAgeYears(
                domainData?.whois?.createdDate,
                domainData?.whois?.expiresDate
            ),
            seo: {
                domain_authority: Number(domainData?.seoMetrics?.metrics?.data?.domain_authority) || 0,
                page_authority: Number(domainData?.seoMetrics?.metrics?.data?.page_authority) || 0,
                backlinks: Number(domainData?.seoMetrics?.metrics?.data?.backlinks) || 0,
                citation_flow: Number(domainData?.seoMetrics?.metrics?.data?.citation_flow) || 0,
                popularity_score: Number(domainData?.seoMetrics?.metrics?.data?.popularity_score) || 0,
                global_rank: Number(domainData?.seoMetrics?.metrics?.data?.global_rank) || null,
                organic_keywords: Number(domainData?.seoMetrics?.metrics?.data?.organic_keywords) || 0
            },
            Safety_Reputation: {
                phishing: !!domainData?.blacklist?.phishing,
                malware: !!domainData?.blacklist?.malware,
                spamming: !!domainData?.blacklist?.spamming,
                adult_content_flag: !!domainData?.blacklist?.adult,
                suspicious: !!domainData?.blacklist?.suspicious,
                suspicious: !!domainData?.ssl?.certificates ? true : false,
                dns_health: !!domainData?.blacklist?.dns_valid,
                reverse_ip_domains: domainData?.reverseIP?.domains?.slice(0, 10) || []
            },
            market_signals: {
                paid_competition: Number(domainData?.seoMetrics?.metrics?.data?.paid_competition) || 0,
                cpc: Number(domainData?.seoMetrics?.metrics?.data?.cpc) || 0,
                on_page_difficulty: Number(domainData?.seoMetrics?.metrics?.data?.on_page_difficulty) || 0,
                off_page_difficulty: Number(domainData?.seoMetrics?.metrics?.data?.off_page_difficulty) || 0
            },

        };

        // 3️⃣ AI Prompt

const prompt = `
You are an expert domain investment advisor with deep knowledge in domain valuation, SEO strategy, and online brand potential.  
You will receive structured domain data with SEO metrics, safety indicators, and market signals.

Your job:  
Generate a **short, actionable, investment-oriented recommendation plan** advising a potential buyer whether to invest in this domain and what strategic actions to take if purchased.

Guidelines:
- First assess whether this domain is worth buying based on the given metrics.
- Provide 3–5 concise action steps focused on maximizing ROI if purchased.
- Highlight opportunities (e.g., SEO growth, branding potential, resale value).
- If there are major risks, clearly state them and suggest mitigation steps.
- Avoid generic advice; be specific to the provided data.
- Keep it professional, clear, and results-driven.

Respond ONLY with valid JSON in this format (no markdown, no extra text):

{
  "investment_recommendation": "Buy / Caution / Avoid",
  "recommendations": [
    "Action step 1",
    "Action step 2",
    "Action step 3"
  ]
}

domainData: ${JSON.stringify(analysisData)}
`;


        // 4️⃣ Call OpenAI
        const aiResponse = await callOpenAI(prompt);

        // 5️⃣ Parse JSON
        let parsed;
        try {
            parsed = JSON.parse(aiResponse);
        } catch (err) {
            throw new Error('AI returned invalid JSON: ' + aiResponse);
        }

        // 6️⃣ Store in cache
        aiCache.set(domainName, parsed);
        console.log(`💾 Cached Buyer AI Recommendations for ${domainName}`);

        return parsed;

    } catch (err) {
        console.error('Error in AIRecommendations:', err);
        return { error: err.message };
    }
};

// 🛠 Helper: Calculate domain age in years
function getDomainAgeYears(createdDate, expiresDate) {
    if (!createdDate) return null;
    const created = new Date(createdDate);
    const now = new Date();
    const diffYears = (now - created) / (1000 * 60 * 60 * 24 * 365);
    return Number(diffYears.toFixed(1));
}

module.exports = { getDomainAIRecommendations };
