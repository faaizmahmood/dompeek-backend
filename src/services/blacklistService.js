const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const getBlacklistData = async (domain) => {

    const url = `https://www.ipqualityscore.com/api/json/url/${process.env.IP_QUALITY_SCORE}/${domain}`
    const response = await axios.get(url);

    console.log("✅ Blacklist response received");

    return response.data;
};

module.exports = { getBlacklistData };

