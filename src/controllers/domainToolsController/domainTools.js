// src/controllers/domainToolsController/domainTools.js
const { getWhoisData } = require("../../services/whoisService.js");
const { getSslData } = require("../../services/sslService.js");
const { getDnsData } = require("../../services/dnsService");
const { getAlternativeDomain } = require("../../services/availabilityService.js");
const { getBlacklistData } = require("../../services/blacklistService.js");
const { getReverseIPData } = require("../../services/reverseIPService.js");
const { getIpGeolocationData } = require("../../services/ipGeolocation.js");
const { getDomainMetrics } = require("../../services/seoService.js");

const getWhois = async (req, res) => {
    try {
        const data = await getWhoisData(req.query.domain);
        res.json(data);
    } catch (e) {
        console.error("WHOIS Error:", e.message);
        res.status(500).json({ error: "WHOIS lookup failed" });
    }
};

const getSSL = async (req, res) => {
    try {
        const data = await getSslData(req.query.domain);
        res.json(data);
    } catch (e) {
         console.error("WHOIS Error:", e.message);
        res.status(500).json({ error: "SSL fetch failed" });
    }
};

const getDNS = async (req, res) => {
    try {
        const data = await getDnsData(req.query.domain);
        res.json(data);
    } catch (e) {
        console.error("WHOIS Error:", e.message);
        res.status(500).json({ error: "DNS fetch failed" });
    }
};

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

const getBlacklist = async (req, res) => {
    const domain = req.query.domain;
    if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
    }

    try {
        const data = await getBlacklistData(req.query.domain);
        res.json(data);
    } catch (e) {
        console.error("IP Quality Score Error:", e.message);
        res.status(500).json({ error: "Blacklist fetch failed" });
    }
};

const getReverseIP = async (req, res) => {
    const domain = req.query.domain;
    if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
    }

    try {
        const data = await getReverseIPData(req.query.domain);
        res.json(data);
    } catch (e) {
        console.error("Reverse IP Error:", e.message);
        res.status(500).json({ error: "Reverse IPfetch failed" });
    }
};

const getIpGeolocation = async (req, res) => {
    const domain = req.query.domain;
    if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
    }

    try {
        const data = await getIpGeolocationData(req.query.domain);
        res.json(data);
    } catch (e) {
        console.error("IP Geolocation Error:", e.message);
        res.status(500).json({ error: "IP Geolocation fetch failed" });
    }
};
 
const getSeoMetrics = async (req, res) => {
    const domain = req.query.domain;
    if (!domain) {
        return res.status(400).json({ error: "Domain is required" });
    }

    try {
        const data = await getDomainMetrics(domain);

        if (data.error) {
            return res.status(500).json({ error: data.error });
        }

        res.json(data);
    } catch (e) {
        console.error("Moz Metrics Error:", e.message);
        res.status(500).json({ error: "Moz Metrics fetch failed" });
    }
};



module.exports = {
    getWhois,
    getSSL,
    getDNS,
    getSuggestions,
    getBlacklist,
    getReverseIP,
    getIpGeolocation,
    getSeoMetrics
};
