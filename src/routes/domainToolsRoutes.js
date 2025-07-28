const express = require('express')
const { getWhois, getSSL, getDNS, getSuggestions, getBlacklist, getReverseIP } = require("../controllers/domainToolsController/domainTools");

const router = express.Router()

router.get("/whois", getWhois);
router.get("/ssl", getSSL);
router.get("/dns", getDNS);
router.get("/suggestions", getSuggestions);
router.get("/blacklist", getBlacklist);
router.get("/reverse-ip", getReverseIP);

module.exports = router;
