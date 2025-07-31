const dotenv = require('dotenv');
const axios = require('axios');
const dns = require('dns').promises;

dotenv.config();

const getIpGeolocationData = async (domain) => {
    try {
        // Step 1: Resolve domain to IP
        const { address: clientIp } = await dns.lookup(domain);

        // Step 2: Fetch IP Geolocation data from ipinfo
        const token = process.env.IPINFO_TOKEN; // Set this in your .env file
        const url = `https://ipinfo.io/${clientIp}/json`;

        const response = await axios.get(url);

        return {
            ip: clientIp,
            geolocation: response.data,
        };

    } catch (error) {
        console.error('Error in getIpGeolocationData:', error.message);
        return { error: 'Failed to fetch geolocation data' };
    }
};

module.exports = { getIpGeolocationData };
