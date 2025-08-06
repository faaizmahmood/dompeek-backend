const { parseDnsRecords } = require("../utils/parseDns");
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const getDnsData = async (domain) => {
    const url = `https://api.hackertarget.com/dnslookup/?q=${domain}`;
    const response = await axios.get(url);

    console.log("✅ DNS response received");

    return parseDnsRecords(response.data);
};

module.exports = { getDnsData };
