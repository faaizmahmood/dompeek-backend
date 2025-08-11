const NodeCache = require('node-cache');
const callOpenAI = require('../utils/openAiCall');

// Cache for 6 hours
const aiCache = new NodeCache({ stdTTL: 21600, checkperiod: 120 });

/**
 * Get AI-powered analysis for Domain History & SEO Strength
 * @param {Object} domainData - Full domain dataset from your other services
 * @returns {Object} AI analysis result
 */
const getDomainHistorySeo = async (domainData) => {
    try {
        const domainName = domainData?.whois?.domainName || null;

        if (!domainName) throw new Error('Missing domain name in data');

        // Check cache first
        const cached = aiCache.get(domainName);
        if (cached) {
            console.log(`📦 AI cache hit for ${domainName} (History & SEO)`);
            return cached;
        }

        // Prepare structured data
                const analysisData = {
            domain: domainName,
            tld: domainData?.whois?.domainNameExt || null,
            expiresDate: domainData?.whois?.expiresDate,
            createdDate: domainData?.whois?.createdDate,
            age_years: getDomainAgeYears(
                domainData?.whois?.createdDate,
                domainData?.whois?.expiresDate
            ),
            seo: {
                domain_authority: Number(domainData?.seoMetrics?.metrics?.data?.domain_authority) || 0,
                page_authority: Number(domainData?.seoMetrics?.metrics?.data?.page_authority) || 0,
                backlinks: Number(domainData?.seoMetrics?.metrics?.data?.backlinks) || 0,
                referring_domains: Number(domainData?.seoMetrics?.metrics?.data?.referring_domains) || 0,
                citation_flow: Number(domainData?.seoMetrics?.metrics?.data?.citation_flow) || 0,
                popularity_score: Number(domainData?.seoMetrics?.metrics?.data?.popularity_score) || 0,
                trust_flow: Number(domainData?.seoMetrics?.metrics?.data?.trust_flow) || 0,
                organic_keywords: Number(domainData?.seoMetrics?.metrics?.data?.organic_keywords) || 0,
                seo_difficulty: Number(domainData?.seoMetrics?.metrics?.data?.seo_difficulty) || 0,
                on_page_difficulty: Number(domainData?.seoMetrics?.metrics?.data?.on_page_difficulty) || 0,
                off_page_difficulty: Number(domainData?.seoMetrics?.metrics?.data?.off_page_difficulty) || 0,
                cpc: Number(domainData?.seoMetrics?.metrics?.data?.cpc) || 0,
                global_rank: Number(domainData?.seoMetrics?.metrics?.data?.global_rank) || null,
            },
            security: {
                phishing: !!domainData?.blacklist?.phishing,
                malware: !!domainData?.blacklist?.malware,
                spamming: !!domainData?.blacklist?.spamming,
                suspicious: !!domainData?.blacklist?.suspicious,
                risky_tld: !!domainData?.blacklist?.risky_tld,
                risk_score: !!domainData?.blacklist?.risk_score,
            },
        };

// AI Prompt
const prompt = `
You are an expert SEO strategist and domain history analyst.
You will receive structured domain WHOIS and SEO metric data in JSON format.

Your task:
1. Produce a short **3–4 sentence expert commentary** on the domain's history & age impact, covering:
   - Age vs. trust in search engines
   - Longevity impact on SEO & branding
   - Expiry date & stability considerations
2. Interpret each SEO metric in **plain language** so a non-technical buyer understands (e.g., "DA 42 = Strong authority for B2C markets").
3. Prepare the output in a **chart-ready format** so it can be directly visualized in the frontend without further processing.

Output:
Respond ONLY with valid JSON in this exact schema (please no markdown, no explanations outside JSON) : 

{
  "history_and_age": {
    "commentary": string, // 3–4 sentence plain text
    "timeline": {
      "labels": ["Created", "Now", "Expiry"],
      "dates": [string, string, string], // ISO format dates
      "age_years": number
    }
  },
  "seo_strength_breakdown": {
    "commentary": string, // Intro sentence for SEO metrics section
    "metrics": [
      {
        "name": string, // Short metric name (e.g., "Domain Authority")
        "value": number,
        "interpretation": string // Plain-language meaning
      }
    ],
    "chart_data": {
      "labels": ["DA", "PA", "Trust Flow", "Citation Flow"],
      "values": [number, number, number, number]
    },
    "overall_score": number, // 0–100 overall SEO strength
    "improvement_actions": [string] // 2–3 prioritized recommendations
  }
}

Data: ${JSON.stringify(analysisData)}
`;



        // Call OpenAI
        const aiResponse = await callOpenAI(prompt);

        // Parse JSON output
        let parsed;
        try {
            parsed = JSON.parse(aiResponse);
        } catch (err) {
            throw new Error(`Invalid AI JSON: ${aiResponse}`);
        }

        // Cache result
        aiCache.set(domainName, parsed);
        console.log(`💾 Cached AI History & SEO for ${domainName}`);

        return parsed;

    } catch (err) {
        console.error('❌ Error in getDomainHistorySeo:', err.message);
        return { error: err.message };
    }
};

// Helper to calculate age in years
function getDomainAgeYears(createdDate) {
    if (!createdDate) return null;
    const created = new Date(createdDate);
    const now = new Date();
    return Number(((now - created) / (1000 * 60 * 60 * 24 * 365)).toFixed(1));
}

module.exports = { getDomainHistorySeo };
