const LinkScan = require("../models/LinkScan");
const { checkUrlSafety } = require("./googleSafeBrowsing");

function computeVerdictFromScore(score) {
  if (score >= 0.7) return "suspicious";
  if (score >= 0.4) return "caution";
  return "safe";
}

async function scanLink(targetUrl, options = { save: true }) {
   const res = await checkUrlSafety(targetUrl);
  const linkScore = res.safe ? 0 : 1;  
  const finalScore = Math.min(1, linkScore);  
  const verdict = computeVerdictFromScore(finalScore);

  const domain = (() => {
    try { return new URL(targetUrl).hostname.replace(/^www\./, ""); }
    catch (e) { return targetUrl; }
  })();

  const record = {
    url: targetUrl,
    domain,
    domainResponse: res.raw || res,
    linkScore,
    verdict,
    metadata: { threats: res.threats || [] },
  };

  if (options.save !== false) {
    const doc = await LinkScan.create(record);
    return { ...record, id: doc._id };
  }
  return record;
}

module.exports = { scanLink };
