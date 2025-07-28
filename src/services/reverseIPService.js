const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const getReverseIPData = async (domain) => {
  try {
    // Step 1: Call ViewDNS reverse IP API directly with domain (no IP lookup needed)
    const response = await axios.get(`https://api.viewdns.info/reverseip/?host=${domain}&apikey=${process.env.VIEW_DNS_API_KEY}&output=json`);

    const result = response.data.response;

    if (result && result.domains && result.domains.length > 0) {
      return {
        ip: result.ip,
        domains: result.domains,
        total: result.domains.length
      };
    } else {
      return {
        ip: result?.ip || null,
        domains: [],
        total: 0,
        message: "No other domains found on this IP."
      };
    }

  } catch (error) {
    console.error('Reverse IP lookup error:', error.message);
    return { error: 'Failed to fetch reverse IP data' };
  }
};

module.exports = { getReverseIPData };
