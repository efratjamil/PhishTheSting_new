const test = require("node:test");
const assert = require("node:assert/strict");
const { parse: parseDomain } = require("tldts");

const { BRAND_CONFIG } = require("../src/brand/brandConfig");
const {
  analyzeUrlBrandSignals,
  detectBrandDetections,
  extractBrandCandidatesFromText,
  isOfficialDomainMatch,
} = require("../src/brand/brandDetector");
const { analyzeUrl } = require("../src/utils/urlAnalyzer");

function analyzeBrandUrl(input) {
  const parsedUrl = new URL(input);
  const domainInfo = parseDomain(parsedUrl.hostname, {
    allowIcannDomains: true,
    allowPrivateDomains: true,
  });

  return analyzeUrlBrandSignals({
    hostname: parsedUrl.hostname,
    registrableDomain: domainInfo.domain || parsedUrl.hostname,
    subdomain: domainInfo.subdomain || "",
    pathname: parsedUrl.pathname,
  });
}

test("officialDomains contains hostnames rather than full URLs or paths", () => {
  for (const brand of BRAND_CONFIG) {
    for (const domain of brand.officialDomains) {
      assert.match(
        domain,
        /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9-]{2,}$/i,
        `${brand.displayName} has an invalid official domain: ${domain}`,
      );
    }
  }
});

test("every configured official domain avoids positive brand-risk points", () => {
  for (const brand of BRAND_CONFIG) {
    for (const domain of brand.officialDomains) {
      const result = analyzeBrandUrl(`https://${domain}`);
      assert.ok(
        result.scoreDelta <= 0,
        `${brand.displayName} official domain ${domain} received ${result.scoreDelta} points`,
      );
    }
  }
});

test("official multi-word and hyphenated brands remain low risk", () => {
  for (const input of [
    "https://bank-yahav.co.il",
    "https://americanexpress.com",
    "https://www.clalbit.co.il",
    "https://www.idf.il",
    "https://www.mekorot.co.il",
    "https://mod.gov.il",
  ]) {
    const result = analyzeUrl(input);
    assert.equal(result.riskLevel, "low", input);
    assert.equal(result.findings.length, 0, input);
  }
});

test("official-domain matching accepts subdomains but rejects suffix attacks", () => {
  assert.equal(isOfficialDomainMatch("login.paypal.com", ["paypal.com"]), true);
  assert.equal(isOfficialDomainMatch("www.paypal.com", ["paypal.com"]), true);
  assert.equal(isOfficialDomainMatch("paypal.com.evil.example", ["paypal.com"]), false);
});

test("visual lookalikes and brand names on foreign domains add meaningful risk", () => {
  const lookalike = analyzeUrl("https://paypa1-login.example.com");
  assert.ok(lookalike.riskScore >= 30);
  assert.ok(lookalike.findings.some((finding) => finding.includes("PayPal")));

  const suffixAttack = analyzeUrl("https://paypal.com.evil.example");
  assert.ok(suffixAttack.riskScore >= 30);
  assert.ok(suffixAttack.findings.some((finding) => finding.includes("PayPal")));
});

test("generic prose is not treated as a brand mention", () => {
  for (const message of [
    "This is a wise decision",
    "Contact our partner today",
    "Get the max value",
    "This is a hot deal",
    "Back to the office",
    "The mod approved it",
  ]) {
    const candidates = extractBrandCandidatesFromText(message);
    const result = detectBrandDetections(candidates);
    assert.deepEqual(result.detections, [], message);
  }
});

test("unambiguous brand mentions in messages are still detected", () => {
  const candidates = extractBrandCandidatesFromText(
    "PayPal asks you to verify your account",
  );
  const result = detectBrandDetections(candidates);

  assert.ok(
    result.detections.some((detection) => detection.detectedBrand === "PayPal"),
  );
});
