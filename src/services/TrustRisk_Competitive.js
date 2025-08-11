const NodeCache = require('node-cache');
const callOpenAI = require('../utils/openAiCall');

// ⏳ Cache for 6 hours (adjust as needed)
const aiCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const getDomainTrustRiskCompetitive = async (domainData) => {
    try {
        const domainName = domainData?.whois?.domainName || null;
        if (!domainName) throw new Error('Missing domain name in data');

        // 1️⃣ Check cache first
        const cached = aiCache.get(domainName);
        if (cached) {
            console.log(`📦 Trust Risk Competitive cache hit for ${domainName}`);
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
            }
        };

        // 3️⃣ AI Prompt

const prompt = `
You are an expert in domain trust analysis, cyber risk assessment, and competitive SEO benchmarking.

You will receive:
1. Domain trust/safety signals
2. Market signals

You do NOT have real competitor data — instead, you must create 3–5 plausible competitor profiles based on:
- The domain's niche inferred from name & TLD
- SEO metrics provided
- Global averages for similar sites

Your tasks:
1. **Trust & Risk Assessment**
   - Summarize the domain's trustworthiness, security posture, and potential risks.
   - Mention any blacklist flags and their implications.
   - Assign a trust score (0–100) with reasoning.

2. **Competitive Snapshot**
   - Invent realistic competitor domains in the same niche.
   - Assign them DA, PA, Trust Flow, backlinks, and traffic using realistic values.
   - Compare our domain's SEO strength against these competitors.
   - Identify where the domain is ahead/behind.
   - Give an overall market positioning statement (leader, average, lagging).

Respond ONLY with strict, valid JSON.  
- Do NOT use any formatting like underscores in numbers.  
- Numbers must be plain digits (e.g., 15000 not 15_000).  
- Strings must be enclosed in double quotes.  
- Do not include comments, markdown, or text outside JSON.

{
  "trust_risk": {
    "summary": string,
    "trust_score": number,
    "key_risks": [string],
    "security_strengths": [string]
  },
  "competitive_snapshot": {
    "summary": string,
    "positioning": string,
    "metrics_comparison": [
      {
        "competitor": string,
        "metric": string,
        "our_value": number,
        "competitor_value": number,
        "gap": string
      }
    ],
    "opportunities": [string]
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
        console.log(`💾 Cached Trust Risk Competitive for ${domainName}`);

        return parsed;

    } catch (err) {
        console.error('Error in getTrustRiskCompetitive:', err);
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

module.exports = { getDomainTrustRiskCompetitive };
