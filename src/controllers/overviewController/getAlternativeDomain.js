const { getAlternativeDomain } = require("../../services/availabilityService.js");

const getSuggestions = async (req, res) => {
    const domain = req.query.domain;
    if (!domain) { 
        return res.status(400).json({ error: "Domain is required" });
    }

    try {
        const suggestions = await getAlternativeDomain(domain);
        res.json(suggestions);
    } catch (e) {
        console.error("Suggestions Error:", e.message);
        res.status(500).json({ error: "Failed to fetch domain suggestions" });
    }
};

module.exports = getSuggestions