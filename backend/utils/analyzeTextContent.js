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
      normalizedMessage.includes(normalizeText(word))
    );
    const filteredMatches = removeOverlappingMatches(matches);

    if (filteredMatches.length > 0) {
      analysis[category] = filteredMatches;
    }
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
    (category) => Array.isArray(analysis[category]) && analysis[category].length > 0
  );

  if (categories.length === 0) {
    return "לא זוהו סימנים מובהקים של פישינג, אך עדיין מומלץ להישאר זהירים.";
  }

  const summaryParts = categories
    .map((category) => categorySummaryLabels[category])
    .filter(Boolean);

  const joinedSummary = joinSummaryParts(summaryParts);

  return `ההודעה מכילה ${joinedSummary} — מאפיינים נפוצים של פישינג`;
}

module.exports = { analyzeMessage, generateSummary };
