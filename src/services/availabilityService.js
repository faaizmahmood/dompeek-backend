const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

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

// 2. WHOISXML API Call for availability
const checkAvailability = async (domain) => {
    const url = `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${process.env.WHOIS_API_KEY}&domainName=${domain}&outputFormat=JSON`;

    try {
        const response = await axios.get(url);
        const status = response.data?.DomainInfo?.domainAvailability;
        return status === "AVAILABLE";
    } catch (error) {
        console.error(`WHOIS API error for ${domain}:`, error.response?.data || error.message);
        return false; // treat as unavailable
    }
};

// 3. Main function - LIMITS TO 10 API CALLS MAX
const getAlternativeDomain = async (domainName) => {
    const base = domainName.split(".")[0]; // remove extension
    const variations = generateDomainSuggestions(base);

    const available = [];

    let attempts = 0;
    for (const domain of variations) {
        if (attempts >= 10) break; // limit to 10 API calls

        const isAvailable = await checkAvailability(domain);
        attempts++;

        if (isAvailable) {
            available.push(domain);
            // You can `break` here if you only want the *first* available
            // break;
        }
    }

    return available;
};

module.exports = { getAlternativeDomain };
