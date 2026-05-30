const { suspiciousWordGroups } = require("../data/suspiciousWords");

const categorySummaryLabels = {
  urgency: "שפה מלחיצה",
  personalInfo: "בקשה למידע אישי",
  action: "הנעה לפעולה",
  bait: "שימוש בפיתוי",
  financial: "הקשר פיננסי",
  technical: "אזהרות טכניות",
};

function normalizeText(text = "") {
  return String(text).toLowerCase().trim();
}

function containsUrlLikeText(text = "") {
  const normalizedText = String(text);
  const schemeBasedUrlPattern = /\bhttps?:\/\/[^\s<>"']+/i;
  const domainLikePattern =
    /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/i;

  return (
    schemeBasedUrlPattern.test(normalizedText) ||
    domainLikePattern.test(normalizedText)
  );
}

function extractUrlLikeTexts(text = "") {
  const normalizedText = String(text);
  const matches = normalizedText.match(
    /\b(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/gi,
  );

  return matches || [];
}

function normalizeLookalikeToken(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[0]/g, "o")
    .replace(/[1|!i]/g, "l")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9]/g, "");
}

function detectLookalikeBrandsInUrls(text = "") {
  const urlLikeTexts = extractUrlLikeTexts(text);
  const findings = [];
  const suspiciousBrands = [
    { labels: ["israelpost", "israel-post"] },
    { labels: ["cal"] },
  ];

  for (const candidate of urlLikeTexts) {
    const normalizedCandidate = normalizeLookalikeToken(candidate);

    for (const brand of suspiciousBrands) {
      for (const label of brand.labels) {
        const normalizedLabel = normalizeLookalikeToken(label);
        if (!normalizedCandidate.includes(normalizedLabel)) continue;
        if (candidate.toLowerCase().includes(label.toLowerCase())) continue;

        findings.push(candidate);
        break;
      }
    }
  }

  return [...new Set(findings)];
}

function removeOverlappingMatches(matches = []) {
  const uniqueMatches = [...new Set(matches)];

  return uniqueMatches
    .sort((a, b) => b.length - a.length)
    .filter((match, index, sortedMatches) => {
      const normalizedMatch = normalizeText(match);

      return !sortedMatches.some((otherMatch, otherIndex) => {
        if (otherIndex === index) {
          return false;
        }

        const normalizedOtherMatch = normalizeText(otherMatch);

        return (
          normalizedOtherMatch.length > normalizedMatch.length &&
          normalizedOtherMatch.includes(normalizedMatch)
        );
      });
    });
}

function analyzeMessage(message = "") {
  const normalizedMessage = normalizeText(message);
  const analysis = {};

  for (const [category, words] of Object.entries(suspiciousWordGroups)) {
    const matches = words.filter((word) =>
      normalizedMessage.includes(normalizeText(word)),
    );
    const filteredMatches = removeOverlappingMatches(matches);

    if (filteredMatches.length > 0) {
      analysis[category] = filteredMatches;
    }
  }

  if (containsUrlLikeText(message)) {
    analysis.action = removeOverlappingMatches([
      ...(analysis.action || []),
      "קישור",
    ]);
  }

  const lookalikeUrlMatches = detectLookalikeBrandsInUrls(message);
  if (lookalikeUrlMatches.length > 0) {
    analysis.technical = removeOverlappingMatches([
      ...(analysis.technical || []),
      "\u05d3\u05d5\u05de\u05d9\u05d9\u05df \u05de\u05ea\u05d7\u05d6\u05d4",
    ]);
    analysis.bait = removeOverlappingMatches([
      ...(analysis.bait || []),
      ...lookalikeUrlMatches,
    ]);
  }

  return analysis;
}

function joinSummaryParts(parts = []) {
  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[0]} ו${parts[1]}`;
  }

  return `${parts.slice(0, -1).join(", ")} ו${parts[parts.length - 1]}`;
}

function generateSummary(analysis = {}) {
  const categories = Object.keys(analysis).filter(
    (category) =>
      Array.isArray(analysis[category]) && analysis[category].length > 0,
  );

  if (categories.length === 0) {
    return "לא זוהו סימנים מובהקים של פישינג, אך עדיין מומלץ להישאר זהירים.";
  }

  const summaryParts = categories
    .map((category) => categorySummaryLabels[category])
    .filter(Boolean);

  const joinedSummary = joinSummaryParts(summaryParts);

  return `ההודעה מכילה ${joinedSummary} - מאפיינים נפוצים של פישינג`;
}

module.exports = { analyzeMessage, generateSummary };
