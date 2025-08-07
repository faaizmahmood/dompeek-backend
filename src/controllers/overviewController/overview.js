const NodeCache = require("node-cache");
const domainCache = new NodeCache({ stdTTL: 600 });

const { getWhoisData } = require("../../services/whoisService.js");
const { getSslData } = require("../../services/sslService.js");
const { getDnsData } = require("../../services/dnsService");
const { checkAvailability } = require("../../services/availabilityService.js");
const { getBlacklistData } = require("../../services/blacklistService.js");
const { getReverseIPData } = require("../../services/reverseIPService.js");
const { getIpGeolocationData } = require("../../services/ipGeolocation.js");
const { getDomainMetrics } = require("../../services/seoService.js");
const scrapeTLDUsage = require("../../services/scrapeTLDUsageService.js");

const domainOverview = async (req, res) => {
    const domain = req.query.domain?.toLowerCase();

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }

    // ✅ 1. Check if domain is available before doing anything else
    const isAvailable = await checkAvailability(domain);

    if (isAvailable) {
        return res.json({
            domain,
            fetchedAt: new Date(),
            available: true,
            message: "Domain is available; no further data to show."
        });
    }

    const cachedData = domainCache.get(domain);
    if (cachedData) {
        return res.json({
            domain,
            fetchedAt: new Date(),
            cached: true,
            results: cachedData
        });
    }

    const tasks = [
        { key: "whois", fn: () => getWhoisData(domain) },
        { key: "ssl", fn: () => getSslData(domain) },
        { key: "dns", fn: () => getDnsData(domain) },
        // { key: "suggestions", fn: () => getAlternativeDomain(domain) },
        { key: "blacklist", fn: () => getBlacklistData(domain) },
        { key: "reverseIP", fn: () => getReverseIPData(domain) },
        { key: "ipGeolocation", fn: () => getIpGeolocationData(domain) },
        { key: "seoMetrics", fn: () => getDomainMetrics(domain) },
        { key: "tldUsage", fn: () => scrapeTLDUsage() },
    ];

    // ✅ Run all tasks in parallel and handle success/failure
    const promises = tasks.map(async ({ key, fn }) => {
        try {
            const data = await fn();
            return { key, success: true, data };
        } catch (err) {
            return { key, success: false, error: err.message || "Unknown error" };
        }
    });

    const results = await Promise.all(promises);

    const response = {};
    results.forEach(result => {
        response[result.key] = result.success
            ? { success: true, data: result.data }
            : { success: false, error: result.error };
    });

    domainCache.set(domain, response);

    return res.json({
        domain,
        fetchedAt: new Date(),
        cached: false,
        results: response
    });
};

module.exports = { domainOverview };
