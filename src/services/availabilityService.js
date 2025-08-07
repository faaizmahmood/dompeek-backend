const axios = require("axios");
const dotenv = require("dotenv");
const NodeCache = require("node-cache");

dotenv.config();

// Setup cache (cache results for 5 minutes)
const availabilityCache = new NodeCache({ stdTTL: 300 });

// 1. Generate name + extension combinations
const generateDomainSuggestions = (base) => {
    const suffixes = ["", "app", "web", "site", "dev"];
    const extensions = [".com", ".net", ".org", ".co", ".me"];

    const suggestions = [];

    for (const suffix of suffixes) {
        for (const ext of extensions) {
            suggestions.push(`${base}${suffix}${ext}`);
        }
    }

    return suggestions;
};

// 2. WHOISXML API Call with caching for availability
const checkAvailability = async (domain) => {
    // Check cache first
    const cachedResult = availabilityCache.get(domain);
    if (cachedResult !== undefined) {
        console.log("⚡ Using cached availability for", domain);
        return cachedResult;
    }

    // If not cached, call API
    const url = `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${process.env.WHOIS_API_KEY}&domainName=${domain}&outputFormat=JSON`;

    try {
        const response = await axios.get(url);
        const status = response.data?.DomainInfo?.domainAvailability;
        const isAvailable = status === "AVAILABLE";

        console.log("✅ Availability response received for", domain);

        // Cache the result
        availabilityCache.set(domain, isAvailable);

        return isAvailable;
    } catch (error) {
        console.error(`❌ WHOIS API error for ${domain}:`, error.response?.data || error.message);
        return false; // treat as unavailable
    }
};

// 3. Main function - LIMITS TO 15 API CALLS MAX
const getAlternativeDomain = async (domainName) => {
    const base = domainName.split(".")[0]; // remove extension
    const variations = generateDomainSuggestions(base);

    const available = [];

    let attempts = 0;
    for (const domain of variations) {
        if (attempts >= 15 || available.length >= 5) break;

        const isAvailable = await checkAvailability(domain);
        attempts++;

        if (isAvailable) {
            available.push(domain);
            if (available.length >= 3) break;
        }
    }

    return available;
};

module.exports = { getAlternativeDomain, checkAvailability };
