const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_SEO_KEY; // Set this in .env

const getDomainMetrics = async (domain) => {
    try {
        const url = `https://domain-seo-analysis.p.rapidapi.com/domain_seo_analysis/?domain=${domain}&method=lite&groups=domain_authority,traffic,keywords`;

        const response = await axios.get(url, {
            headers: {
                'x-rapidapi-host': 'domain-seo-analysis.p.rapidapi.com',
                'x-rapidapi-key': RAPIDAPI_KEY,
            },
        });

        console.log("✅ SEO response received");
        return {
            domain,
            metrics: response.data || {},
        };

    } catch (error) {
        console.error('Error in getDomainMetrics:', error.response?.data || error.message);
        return { error: 'Failed to fetch SEO metrics from RapidAPI' };
    }
};

module.exports = {
    getDomainMetrics,
};
