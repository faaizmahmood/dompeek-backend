// ✅ Correct (CommonJS)
function parseDnsRecords(dnsRawText) {
    const records = { A: [], MX: [], NS: [], TXT: [], SOA: [], Others: [] };
    const lines = dnsRawText.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        const [type, value] = trimmedLine.split(/\s*:\s*/, 2);
        if (records[type]) records[type].push(value);
        else records.Others.push(trimmedLine);
    }

    return records;
}

module.exports = {
    parseDnsRecords
};
