const { URL } = require("node:url");
const { parse: parseDomain } = require("tldts");
const { BRAND_CONFIG } = require("./brandConfig");

const VISUAL_REPLACEMENTS = [
  [/[@]/g, "a"],
  [/[0o]/g, "o"],
  [/[1!|i]/g, "l"],
  [/[5$]/g, "s"],
  [/[3]/g, "e"],
  [/[4]/g, "a"],
  [/[7]/g, "t"],
  [/['״׳"`´]/g, ""],
];

const MIN_CANDIDATE_LENGTH = 4;
const SHORT_ALIAS_MIN_LENGTH = 2;

function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function normalizeBrandToken(value = "") {
  let normalized = String(value).toLowerCase().normalize("NFKC");

  for (const [pattern, replacement] of VISUAL_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized.replace(/[^\p{L}\p{N}]+/gu, "");
}

function createVisualSkeleton(value = "") {
  return normalizeBrandToken(value).replace(/[il]/g, "l");
}

function tokenizeBrandText(value = "") {
  return safeDecode(value)
    .toLowerCase()
    .normalize("NFKC")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 3);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
}

function buildAdjacentCandidates(tokens = [], source) {
  const candidates = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];
    candidates.push({
      rawValue: current,
      source,
    });

    if (index < tokens.length - 1) {
      candidates.push({
        rawValue: `${current}${tokens[index + 1]}`,
        source,
      });
    }
  }

  return candidates;
}

function dedupeCandidates(candidates = []) {
  const seen = new Set();

  return candidates.filter((candidate) => {
    const rawValue = String(candidate.rawValue || "").trim();
    if (!rawValue) return false;

    const normalizedValue = normalizeBrandToken(rawValue);
    if (normalizedValue.length < SHORT_ALIAS_MIN_LENGTH) return false;

    const key = `${candidate.source}:${normalizedValue}`;
    if (seen.has(key)) return false;
    seen.add(key);

    candidate.normalizedValue = normalizedValue;
    candidate.visualSkeleton = createVisualSkeleton(rawValue);
    return true;
  });
}

function extractBrandCandidatesFromText(messageText = "") {
  const textWithoutUrls = String(messageText)
    .replace(/\bhttps?:\/\/[^\s<>"']+/gi, " ")
    .replace(
      /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/gi,
      " ",
    );

  return dedupeCandidates(
    buildAdjacentCandidates(tokenizeBrandText(textWithoutUrls), "message"),
  );
}

function normalizeUrlInput(url = "") {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function extractBrandCandidatesFromUrlParts({
  rawUrl = "",
  hostname = "",
  registrableDomain = "",
  subdomain = "",
  pathname = "",
} = {}) {
  const candidates = [];
  const hostTokens = tokenizeBrandText(String(hostname).replace(/\./g, "-"));
  const subdomainTokens = tokenizeBrandText(String(subdomain).replace(/\./g, "-"));
  const pathTokens = tokenizeBrandText(pathname);
  const registrableLabel = String(registrableDomain).split(".")[0] || "";

  candidates.push(...buildAdjacentCandidates(hostTokens, "hostname"));
  candidates.push(...buildAdjacentCandidates(subdomainTokens, "subdomain"));
  candidates.push(...buildAdjacentCandidates(pathTokens, "path"));

  if (registrableLabel) {
    candidates.push({ rawValue: registrableLabel, source: "domain" });
  }

  if (rawUrl) {
    candidates.push({ rawValue: rawUrl, source: "url" });
  }

  return dedupeCandidates(candidates);
}

function extractBrandCandidates({
  messageText = "",
  extractedUrls = [],
  fullDomain = "",
  hostname = "",
  registrableDomain = "",
  subdomain = "",
  pathname = "",
} = {}) {
  const candidates = [
    ...extractBrandCandidatesFromText(messageText),
    ...extractBrandCandidatesFromUrlParts({
      rawUrl: "",
      hostname: hostname || fullDomain,
      registrableDomain,
      subdomain,
      pathname,
    }),
  ];

  for (const url of extractedUrls) {
    try {
      const parsed = new URL(normalizeUrlInput(url));
      const domainInfo = parseDomain(parsed.hostname, {
        allowIcannDomains: true,
        allowPrivateDomains: true,
      });

      candidates.push(
        ...extractBrandCandidatesFromUrlParts({
          rawUrl: url,
          hostname: parsed.hostname,
          registrableDomain: domainInfo.domain || parsed.hostname,
          subdomain: domainInfo.subdomain || "",
          pathname: parsed.pathname,
        }),
      );
    } catch {
      candidates.push(...dedupeCandidates([{ rawValue: url, source: "url" }]));
    }
  }

  return dedupeCandidates(candidates);
}

function aliasEntriesForBrand(brand) {
  return [...new Set([brand.displayName, ...(brand.aliases || [])])]
    .map((alias) => ({
      alias,
      normalizedAlias: normalizeBrandToken(alias),
      visualAlias: createVisualSkeleton(alias),
    }))
    .filter((entry) => entry.normalizedAlias.length >= SHORT_ALIAS_MIN_LENGTH);
}

function isKnownShortAlias(candidate = {}, brandConfig = BRAND_CONFIG) {
  const normalizedValue = String(candidate.normalizedValue || "");
  const visualSkeleton = String(candidate.visualSkeleton || "");

  if (!normalizedValue) {
    return false;
  }

  return brandConfig.some((brand) =>
    aliasEntriesForBrand(brand).some(
      (aliasEntry) =>
        aliasEntry.normalizedAlias === normalizedValue ||
        aliasEntry.visualAlias === visualSkeleton,
    ),
  );
}

function isOfficialDomainMatch(fullDomain = "", officialDomains = []) {
  const normalizedDomain = String(fullDomain).toLowerCase().replace(/\.$/, "");

  return officialDomains.some((officialDomain) => {
    const normalizedOfficial = String(officialDomain).toLowerCase();
    return (
      normalizedDomain === normalizedOfficial ||
      normalizedDomain.endsWith(`.${normalizedOfficial}`)
    );
  });
}

function looksBrandLike(candidate = {}) {
  const rawValue = String(candidate.rawValue || "");
  const normalizedValue = String(candidate.normalizedValue || "");

  return (
    normalizedValue.length >= MIN_CANDIDATE_LENGTH &&
    normalizedValue.length <= 24 &&
    /[a-zא-ת]/i.test(rawValue) &&
    (/[0-9@$!|]/.test(rawValue) || /[-_.]/.test(rawValue) || candidate.source !== "message")
  );
}

function scoreBrandCandidate(candidate, aliasEntry) {
  const rawValue = String(candidate.rawValue || "");
  const normalizedValue = candidate.normalizedValue;
  const visualSkeleton = candidate.visualSkeleton;
  const normalizedAlias = aliasEntry.normalizedAlias;
  const visualAlias = aliasEntry.visualAlias;

  if (!normalizedValue || !normalizedAlias) return null;

  if (rawValue.toLowerCase() === String(aliasEntry.alias).toLowerCase()) {
    return {
      confidence: 100,
      reason: `exact alias match for "${aliasEntry.alias}"`,
      isLookalike: false,
    };
  }

  if (normalizedValue === normalizedAlias) {
    return {
      confidence: 95,
      reason: `normalized match for "${aliasEntry.alias}"`,
      isLookalike: true,
    };
  }

  if (visualSkeleton === visualAlias) {
    return {
      confidence: 92,
      reason: `visual lookalike match for "${aliasEntry.alias}"`,
      isLookalike: true,
    };
  }

  const distance = levenshtein(normalizedValue, normalizedAlias);
  if (distance === 1) {
    return {
      confidence: 84,
      reason: `edit distance 1 from "${aliasEntry.alias}"`,
      isLookalike: true,
    };
  }

  if (
    distance === 2 &&
    Math.max(normalizedValue.length, normalizedAlias.length) >= 8
  ) {
    return {
      confidence: 72,
      reason: `edit distance 2 from "${aliasEntry.alias}"`,
      isLookalike: true,
    };
  }

  return null;
}

function matchBrandCandidate(candidate, brandConfig = BRAND_CONFIG) {
  let bestMatch = null;

  for (const brand of brandConfig) {
    const aliasEntries = aliasEntriesForBrand(brand);

    for (const aliasEntry of aliasEntries) {
      const scored = scoreBrandCandidate(candidate, aliasEntry);
      if (!scored) continue;

      const match = {
        detectedBrand: brand.displayName,
        matchedAlias: aliasEntry.alias,
        confidence: scored.confidence,
        reason: scored.reason,
        isLookalike: scored.isLookalike,
        category: brand.category,
        source: candidate.source,
        rawValue: candidate.rawValue,
        normalizedValue: candidate.normalizedValue,
        officialDomains: brand.officialDomains || [],
      };

      if (!bestMatch || match.confidence > bestMatch.confidence) {
        bestMatch = match;
      }
    }
  }

  return bestMatch;
}

function detectBrandDetections(candidates = [], brandConfig = BRAND_CONFIG) {
  const detections = [];
  const ambiguousMatches = [];
  const unmatchedBrandLikeCandidates = [];

  for (const candidate of candidates) {
    const match = matchBrandCandidate(candidate, brandConfig);

    if (!match) {
      if (
        normalizedCandidateLengthAllowed(candidate, brandConfig) &&
        looksBrandLike(candidate)
      ) {
        unmatchedBrandLikeCandidates.push(candidate);
      }
      continue;
    }

    if (match.confidence >= 80) {
      detections.push(match);
      continue;
    }

    ambiguousMatches.push(match);
  }

  const bestDetections = new Map();
  for (const detection of detections) {
    const key = `${detection.detectedBrand}:${detection.source}:${detection.rawValue}`;
    const current = bestDetections.get(key);
    if (!current || detection.confidence > current.confidence) {
      bestDetections.set(key, detection);
    }
  }

  return {
    detections: [...bestDetections.values()],
    ambiguousMatches,
    unmatchedBrandLikeCandidates,
  };
}

function normalizedCandidateLengthAllowed(candidate = {}, brandConfig = BRAND_CONFIG) {
  const normalizedValue = String(candidate.normalizedValue || "");

  return (
    normalizedValue.length >= MIN_CANDIDATE_LENGTH || isKnownShortAlias(candidate, brandConfig)
  );
}

function analyzeUrlBrandSignals({
  hostname = "",
  registrableDomain = "",
  subdomain = "",
  pathname = "",
  brandConfig = BRAND_CONFIG,
} = {}) {
  const candidates = extractBrandCandidatesFromUrlParts({
    hostname,
    registrableDomain,
    subdomain,
    pathname,
  });
  const { detections, ambiguousMatches, unmatchedBrandLikeCandidates } =
    detectBrandDetections(candidates, brandConfig);

  const findings = [];
  let scoreDelta = 0;
  let lookalikeMatchCount = 0;
  let officialBrandConfidence = 0;

  for (const detection of detections) {
    const onOfficialDomain = isOfficialDomainMatch(
      hostname || registrableDomain,
      detection.officialDomains,
    );

    if (onOfficialDomain && !detection.isLookalike) {
      officialBrandConfidence += 1;
      scoreDelta -= detection.source === "hostname" || detection.source === "domain" ? 8 : 4;
      continue;
    }

    const highValueSource =
      detection.source === "hostname" ||
      detection.source === "subdomain" ||
      detection.source === "domain";
    const basePoints = detection.isLookalike
      ? highValueSource
        ? 32
        : 28
      : highValueSource
        ? 18
        : 14;

    scoreDelta += basePoints;
    if (detection.isLookalike) {
      lookalikeMatchCount += 1;
    }

    findings.push(
      onOfficialDomain
        ? `זוהה שימוש בשם הדומה למותג ${detection.detectedBrand} בתוך ה-${detection.source}, אך הכתיב נראה מטעה.`
        : `זוהה שימוש בשם הדומה למותג ${detection.detectedBrand} בדומיין שאינו רשמי.`,
    );
  }

  for (const ambiguousMatch of ambiguousMatches) {
    if (
      !isOfficialDomainMatch(hostname || registrableDomain, ambiguousMatch.officialDomains)
    ) {
      scoreDelta += 8;
    }
  }

  return {
    findings,
    scoreDelta,
    detections,
    ambiguousMatches,
    unmatchedBrandLikeCandidates,
    lookalikeMatchCount,
    officialBrandConfidence,
  };
}

module.exports = {
  BRAND_CONFIG,
  normalizeBrandToken,
  createVisualSkeleton,
  extractBrandCandidates,
  extractBrandCandidatesFromText,
  extractBrandCandidatesFromUrlParts,
  detectBrandDetections,
  analyzeUrlBrandSignals,
  isOfficialDomainMatch,
};
