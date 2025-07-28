const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const getWhoisData = async (domain) => {
    try {
        const apiKey = process.env.WHOIS_API_KEY;
        if (!apiKey) {
            throw new Error("WHOIS_API_KEY not defined in .env");
        }

        const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`;
        console.log("🔗 WHOIS URL:", url);

        const response = await axios.get(url);
        console.log("✅ WHOIS response received");

        return response.data.WhoisRecord;
    } catch (error) {
        console.error("❌ WHOIS API call failed:", error.message);
        if (error.response?.data) {
            console.error("👉 Response:", error.response.data);
        }
        throw new Error("WHOIS lookup failed");
    }
};

module.exports = { getWhoisData };
