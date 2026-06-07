const { suspiciousWordGroups } = require("../data/suspiciousWords");
const { URL } = require("node:url");
const { parse: parseDomain } = require("tldts");
const {
  extractBrandCandidates,
  detectBrandDetections,
  isOfficialDomainMatch,
} = require("../src/brand/brandDetector");

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

function findUrlLikeSegments(text = "") {
  const sourceText = String(text);
  const schemePattern = /\bhttps?:\/\/[^\s<>"']+/gi;
  const domainPattern =
    /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/gi;
  const segments = [];

  const addMatch = (match, index) => {
    if (typeof match !== "string" || typeof index !== "number") {
      return;
    }

    const value = match.replace(/[),.;!?]+$/g, "");
    if (!value) {
      return;
    }

    segments.push({
      value,
      start: index,
      end: index + value.length,
    });
  };

  for (const match of sourceText.matchAll(schemePattern)) {
    addMatch(match[0], match.index);
  }

  for (const match of sourceText.matchAll(domainPattern)) {
    const value = match[0];
    const start = match.index;
    const end = start + value.length;
    const overlapsSchemeMatch = segments.some(
      (segment) => start >= segment.start && end <= segment.end,
    );

    if (!overlapsSchemeMatch) {
      addMatch(value, start);
    }
  }

  return segments.sort((left, right) => left.start - right.start);
}

function containsUrlLikeText(text = "") {
  return findUrlLikeSegments(text).length > 0;
}

function extractUrlLikeTexts(text = "") {
  return findUrlLikeSegments(text).map((segment) => segment.value);
}

function hasMeaningfulNonUrlText(text = "") {
  const sourceText = String(text);
  const segments = findUrlLikeSegments(sourceText);

  if (segments.length === 0) {
    return sourceText.trim().length > 0;
  }

  let cursor = 0;
  let remainder = "";

  for (const segment of segments) {
    remainder += sourceText.slice(cursor, segment.start);
    cursor = segment.end;
  }

  remainder += sourceText.slice(cursor);
  return remainder.trim().length > 0;
}

function detectSuspiciousBrandUrls(text = "") {
  const urlLikeTexts = extractUrlLikeTexts(text);
  const suspiciousMatches = [];

  for (const urlText of urlLikeTexts) {
    try {
      const normalizedUrl = /^https?:\/\//i.test(urlText)
        ? urlText
        : `https://${urlText}`;
      const parsed = new URL(normalizedUrl);
      const domainInfo = parseDomain(parsed.hostname, {
        allowIcannDomains: true,
        allowPrivateDomains: true,
      });
      const hostname = parsed.hostname.toLowerCase();
      const registrableDomain = (domainInfo.domain || parsed.hostname).toLowerCase();
      const subdomain = domainInfo.subdomain || "";

      const candidates = extractBrandCandidates({
        extractedUrls: [normalizedUrl],
        hostname,
        fullDomain: hostname,
        registrableDomain,
        subdomain,
        pathname: parsed.pathname,
      });
      const { detections, ambiguousMatches } = detectBrandDetections(candidates);
      const matchedSignals = [...detections, ...ambiguousMatches].filter((match) => {
        if (match.source === "message") return false;
        if (match.confidence < 72) return false;

        const official = isOfficialDomainMatch(hostname, match.officialDomains || []);
        if (official && !match.isLookalike) return false;

        return true;
      });

      suspiciousMatches.push(...matchedSignals);
    } catch {
      continue;
    }
  }

  return suspiciousMatches;
}

function detectBrandLikeTextSignals(text = "") {
  const candidates = extractBrandCandidates({
    messageText: text,
    extractedUrls: extractUrlLikeTexts(text),
  });
  const { detections, ambiguousMatches } = detectBrandDetections(candidates);

  return [...detections, ...ambiguousMatches].filter(
    (match) =>
      match.source === "message" && match.confidence >= 72 && match.isLookalike,
  );
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

  if (containsUrlLikeText(message) && hasMeaningfulNonUrlText(message)) {
    analysis.action = removeOverlappingMatches([
      ...(analysis.action || []),
      "קישור",
    ]);
  }

  const suspiciousBrandUrlMatches = detectSuspiciousBrandUrls(message);
  if (suspiciousBrandUrlMatches.length > 0) {
    analysis.technical = removeOverlappingMatches([
      ...(analysis.technical || []),
      "\u05d3\u05d5\u05de\u05d9\u05d9\u05df \u05de\u05ea\u05d7\u05d6\u05d4",
    ]);
    analysis.technical = removeOverlappingMatches([
      ...(analysis.technical || []),
      "\u05d4\u05ea\u05d7\u05d6\u05d5\u05ea \u05dc\u05de\u05d5\u05ea\u05d2",
    ]);
    analysis.bait = removeOverlappingMatches([
      ...(analysis.bait || []),
      ...suspiciousBrandUrlMatches.map((match) => match.rawValue),
    ]);
  }

  const brandLikeTextSignals = detectBrandLikeTextSignals(message);
  if (brandLikeTextSignals.length > 0) {
    analysis.technical = removeOverlappingMatches([
      ...(analysis.technical || []),
      "\u05d4\u05ea\u05d7\u05d6\u05d5\u05ea \u05dc\u05de\u05d5\u05ea\u05d2",
    ]);
    analysis.bait = removeOverlappingMatches([
      ...(analysis.bait || []),
      ...brandLikeTextSignals.map((signal) => signal.rawValue),
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
