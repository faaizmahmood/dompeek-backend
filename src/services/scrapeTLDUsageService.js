// scrapeTLDUsage.js
const axios = require("axios");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");

const URL = "https://research.domaintools.com/statistics/tld-counts/";
const cache = new NodeCache({ stdTTL: 86400 }); // 86400 seconds = 24 hours
const CACHE_KEY = "tld_usage";

const scrapeTLDUsage = async () => {
  // ✅ Check cache first
  const cachedData = cache.get(CACHE_KEY);
  if (cachedData) {
    console.log("⚡ Returning cached TLD data");
    return cachedData;
  }

  try {
    const { data: html } = await axios.get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(html);
    const results = [];

    $("#tld-counts tbody tr").each((i, row) => {
      if (i >= 5) return false; // Stop after 100 entries 

      const tld = $(row).find("td.name").text().trim();
      const countText = $(row).find("td.amount").text().trim().replace(/,/g, "");
      const count = parseInt(countText, 10);

      if (tld && count) {
        results.push({ tld, count });
      }
    });

    // ✅ Save in cache
    cache.set(CACHE_KEY, results);
    console.log(`✅ Scraped and cached top ${results.length} TLD entries`);
    return results;
  } catch (err) {
    console.error("❌ Scrape error:", err.message);
    return [];
  }
};

module.exports = scrapeTLDUsage;
