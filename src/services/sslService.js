const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const getSslData = async (domain) => {
    const url = `https://ssl-certificates.whoisxmlapi.com/api/v1?apiKey=${process.env.WHOIS_API_KEY}&domainName=${domain}`;
    const response = await axios.get(url);
    return response.data;
};

module.exports = { getSslData };

