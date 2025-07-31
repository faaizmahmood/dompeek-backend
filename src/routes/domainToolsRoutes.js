const express = require('express')
const { getWhois, getSSL, getDNS, getSuggestions, getBlacklist, getReverseIP, getIpGeolocation } = require("../controllers/domainToolsController/domainTools");
const rateLimiter = require('../middleware/rateLimiter')
const userMiddleware = require('../middleware/userLimitMiddleware')

const router = express.Router()

router.get("/whois", userMiddleware, rateLimiter, getWhois);
router.get("/ssl", getSSL);
router.get("/dns", getDNS);
router.get("/suggestions", getSuggestions);
router.get("/blacklist", getBlacklist);
router.get("/reverse-ip", getReverseIP);
router.get("/ip-geolocation", getIpGeolocation);

module.exports = router;
