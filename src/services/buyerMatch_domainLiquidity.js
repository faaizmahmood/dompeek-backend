const NodeCache = require('node-cache');
const callOpenAI = require('../utils/openAiCall');

// ⏳ Cache for 6 hours (adjust as needed)
const aiCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const getDomainBuyerMatchDomainLiquidity = async (domainData) => {
    try {
        const domainName = domainData?.whois?.domainName || null;
        if (!domainName) throw new Error('Missing domain name in data');

        // 1️⃣ Check cache first
        const cached = aiCache.get(domainName);
        if (cached) {
            console.log(`📦 Trust Buyer Match Domain Liquidity cache hit for ${domainName}`);
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
You are an expert in domain valuation, brandability analysis, and buyer persona generation.

You will receive:
1. Domain identity details (name, TLD, age)
2. Safety and reputation indicators
3. Market & SEO signals

You must:
- Infer the domain's potential uses, target industries, and demand level.
- Consider brandability (short, memorable, relevant), SEO potential, and market demand.
- Base reasoning on provided metrics and realistic industry benchmarks.

Your tasks:

1. **Buyer Match**
   - Invent 3–5 realistic buyer personas for this domain.
     Examples: "E-commerce startup in South Asia", "Fintech SaaS targeting SMEs in EU"
   - For each persona, include:
     - \`label\`: Short description
     - \`match_percent\`: number (0–100) estimating fit
     - \`reason\`: Short explanation of why this persona would find the domain valuable
   - Ensure percentages are realistic and not all maxed out.
   - Include a sorted horizontal bar chart dataset (\`buyer_chart_data\`) with each persona label + match %.

2. **Domain Liquidity Meter**
   - Score resale ease from 1–10 (\`liquidity_score\`) based on:
     - Brandability (short, memorable, niche relevance)
     - SEO metrics (traffic, competition, backlink profile)
     - Market demand (keywords, trends, TLD desirability)
   - Provide \`reason\`: short explanation for score.
   - Output \`speedometer_data\`: dataset ready for a speedometer chart.

Respond ONLY with valid JSON in this schema (no markdown, no explanations outside JSON):

{
  "buyer_match": {
    "personas": [
      { "label": string, "match_percent": number, "reason": string }
    ],
    "buyer_chart_data": [
      { "label": string, "value": number }
    ]
  },
  "domain_liquidity": {
    "liquidity_score": number,
    "reason": string,
    "speedometer_data": { "value": number, "min": 0, "max": 10 }
  }
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
        console.log(`💾 Cached Buyer MatchDomain Liquidity for ${domainName}`);

        return parsed;

    } catch (err) {
        console.error('Error in BuyerMatchDomainLiquidity:', err);
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

module.exports = { getDomainBuyerMatchDomainLiquidity };
