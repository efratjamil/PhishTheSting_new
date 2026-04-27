const axios = require("axios");

const SAFE_BROWSING_ENDPOINT =
  "https://safebrowsing.googleapis.com/v4/threatMatches:find";

async function checkUrlSafety(url) {
  const keySource = process.env.GOOGLE_API_KEY
    ? "GOOGLE_API_KEY"
    : process.env.GOOGLE_SAFE_BROWSING_KEY
      ? "GOOGLE_SAFE_BROWSING_KEY"
      : null;

  const apiKey =
    process.env.GOOGLE_API_KEY || process.env.GOOGLE_SAFE_BROWSING_KEY;

  if (!url || typeof url !== "string") {
    const error = new Error("A valid url string is required");
    error.statusCode = 400;
    error.details = { url };
    throw error;
  }

  if (!apiKey) {
    const error = new Error(
      "Google Safe Browsing API key is not set. Expected GOOGLE_API_KEY or GOOGLE_SAFE_BROWSING_KEY.",
    );
    error.statusCode = 500;
    error.details = {
      hasGoogleApiKey: Boolean(process.env.GOOGLE_API_KEY),
      hasLegacySafeBrowsingKey: Boolean(process.env.GOOGLE_SAFE_BROWSING_KEY),
    };
    console.error("Google Safe Browsing configuration error:", error.details);
    throw error;
  }

  try {
    console.log("Google Safe Browsing request starting", {
      endpoint: SAFE_BROWSING_ENDPOINT,
      url,
      keySource,
    });

    const response = await axios.post(
      `${SAFE_BROWSING_ENDPOINT}?key=${apiKey}`,
      {
        client: {
          clientId: "phishthesting-app",
          clientVersion: "1.0",
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      },
      {
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
        proxy: false,
      },
    );

    console.log("Google Safe Browsing request completed", {
      status: response.status,
      hasMatches:
        Array.isArray(response.data?.matches) &&
        response.data.matches.length > 0,
      matchCount: Array.isArray(response.data?.matches)
        ? response.data.matches.length
        : 0,
    });

    const matches = Array.isArray(response.data?.matches)
      ? response.data.matches
      : [];

    if (matches.length > 0) {
      return {
        safe: false,
        threats: [...new Set(matches.map((match) => match.threatType))],
        raw: response.data,
      };
    }

    return {
      safe: true,
      threats: [],
      raw: response.data || {},
    };
  } catch (err) {
    const details = {
      message: err?.message || "API request failed",
      code: err?.code || null,
      status: err?.response?.status || null,
      responseData: err?.response?.data || null,
      keySource,
      url,
      endpoint: SAFE_BROWSING_ENDPOINT,
      proxy: {
        HTTP_PROXY: process.env.HTTP_PROXY || null,
        HTTPS_PROXY: process.env.HTTPS_PROXY || null,
        ALL_PROXY: process.env.ALL_PROXY || null,
        NO_PROXY: process.env.NO_PROXY || null,
      },
    };

    console.error("Google Safe Browsing error:", details);

    const error = new Error(
      `Google Safe Browsing request failed: ${details.message}`,
    );
    error.statusCode = err?.response?.status || 502;
    error.details = details;
    throw error;
  }
}

module.exports = { checkUrlSafety };
