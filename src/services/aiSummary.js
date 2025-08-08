const NodeCache = require('node-cache');
const callOpenAI = require('../utils/openAiCall');

// ⏳ Cache for 6 hours (adjust as needed)
const aiCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const getDomainAISummary = async (domainData) => {
    try {
        const domainName = domainData?.whois?.domainName || null;
        if (!domainName) throw new Error('Missing domain name in data');

        // 1️⃣ Check cache first
        const cached = aiCache.get(domainName);
        if (cached) {
            console.log(`📦 AI summary cache hit for ${domainName}`);
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
                domain_authority: Number(domainData?.metrics?.data?.domain_authority) || 0,
                page_authority: Number(domainData?.metrics?.data?.page_authority) || 0,
                backlinks: Number(domainData?.metrics?.data?.backlinks) || 0,
                citation_flow: Number(domainData?.metrics?.data?.citation_flow) || 0,
                popularity_score: Number(domainData?.metrics?.data?.popularity_score) || 0,
                global_rank: Number(domainData?.metrics?.data?.global_rank) || null,
                organic_keywords: Number(domainData?.metrics?.data?.organic_keywords) || 0
            },
            security: {
                phishing: !!domainData?.blacklist?.phishing,
                malware: !!domainData?.blacklist?.malware,
                spamming: !!domainData?.blacklist?.spamming,
                suspicious: !!domainData?.blacklist?.suspicious,
                risky_tld: !!domainData?.blacklist?.risky_tld
            },
            market_signals: {
                paid_competition: Number(domainData?.metrics?.data?.paid_competition) || 0,
                cpc: Number(domainData?.metrics?.data?.cpc) || 0,
                on_page_difficulty: Number(domainData?.metrics?.data?.on_page_difficulty) || 0,
                off_page_difficulty: Number(domainData?.metrics?.data?.off_page_difficulty) || 0
            }
        };

        // 3️⃣ AI Prompt
const prompt = `
You are an expert domain market analyst and AI pricing engine.

You will receive structured domain analysis data in JSON format.

Your task:
1. Predict a fair market price for the domain (USD) **as if it is being sold in today's open market, NOT including brand trademark value or ownership by existing corporations**.
2. Keep valuations realistic — most domains are worth between $50 and $500,000. If extremely premium, do not exceed $1,000,000.
3. Suggest realistic primary and secondary use cases.
4. Identify the most likely ideal buyers (e.g., agencies, startups, e-commerce brands).
5. Generate important flags: warnings (risks) and strengths (value drivers).

⚠️ Formatting Rules:
- Respond ONLY with valid JSON.
- Do NOT include any markdown formatting, explanations, or extra text.
- Do NOT wrap the JSON in \`\`\`json or \`\`\`.
- Use double quotes for all keys and string values.
- Ensure the JSON is 100% parseable in JavaScript without modifications.

Output Schema:
{
  "predicted_price_usd": number,
  "suggested_use_cases": [string],
  "ideal_buyers": [string],
  "flags": {
    "warnings": [string],
    "strengths": [string]
  }
}

Here is the domain data to analyze:
${JSON.stringify(analysisData)}
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
        console.log(`💾 Cached AI summary for ${domainName}`);

        return parsed;

    } catch (err) {
        console.error('Error in getDomainAISummary:', err);
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

module.exports = { getDomainAISummary };
