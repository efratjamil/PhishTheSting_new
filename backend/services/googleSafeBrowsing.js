const axios = require("axios");
const API_KEY = process.env.GOOGLE_SAFE_BROWSING_KEY;
const ENDPOINT = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

async function checkUrlSafety(url) {
  try {
    const body = {
      client: { clientId: "phishthesting-app", clientVersion: "1.0" },
      threatInfo: {
        threatTypes: ["MALWARE","SOCIAL_ENGINEERING","UNWANTED_SOFTWARE"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }]
      }
    };
    const resp = await axios.post(ENDPOINT, body, { timeout: 10000 });
    const data = resp.data || {};
    if (data.matches && data.matches.length) {
      const threats = data.matches.map(m => m.threatType);
      return { safe: false, threats, raw: data };
    }
    return { safe: true, threats: [], raw: data };
  } catch (err) {
    console.error("Google Safe Browsing error:", err?.message || err);
    return { safe: false, threats: ["API_ERROR"], raw: { error: err?.message } };
  }
}

module.exports = { checkUrlSafety };
