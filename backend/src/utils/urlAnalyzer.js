// npm i tldts
const { URL } = require('node:url');
const { isIP } = require('node:net');
const punycode = require('node:punycode');
const axios = require('axios');
const { parse: parseDomain } = require('tldts');

const SHORTENER_HOSTS = new Set([
  'bit.ly',
  't.co',
  'tinyurl.com',
  'goo.gl',
  'ow.ly',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
  'is.gd',
  'tiny.cc',
]);

const SUSPICIOUS_WORDS = [
  'login',
  'signin',
  'sign-in',
  'verify',
  'verification',
  'secure',
  'update',
  'account',
  'password',
  'reset',
  'wallet',
  'bank',
  'billing',
  'invoice',
  'gift',
  'crypto',
  'support',
  'sso',
];

const REDIRECT_PARAMS = new Set([
  'url',
  'u',
  'to',
  'target',
  'dest',
  'destination',
  'redirect',
  'redirect_url',
  'redirect_uri',
  'continue',
  'return',
  'return_to',
  'next',
  'callback',
]);

// חשוב: זה חייב להיות קונפיגורציה שלך, לא רשימת "כל העולם".
// לפרויקט אקדמי/מוצר MVP בחרי סט מותגים רלוונטי.
const BRAND_CONFIG = [
  {
    brand: 'google',
    category: 'technology',
    legitDomains: ['google.com', 'google.co.il', 'googleapis.com', 'googleusercontent.com'],
  },
  {
    brand: 'microsoft',
    category: 'technology',
    legitDomains: ['microsoft.com', 'live.com', 'office.com', 'outlook.com', 'microsoftonline.com'],
  },
  {
    brand: 'apple',
    category: 'technology',
    legitDomains: ['apple.com', 'icloud.com'],
  },
  {
    brand: 'visa',
    category: 'banking',
    legitDomains: ['visa.com'],
  },
  {
    brand: 'mastercard',
    category: 'banking',
    legitDomains: ['mastercard.com'],
  },
  {
    brand: 'bank',
    category: 'banking',
    legitDomains: ['bankofamerica.com', 'bank.co.il'],
  },
  {
    brand: 'leumi',
    category: 'banking',
    legitDomains: ['leumi.co.il'],
  },
  {
    brand: 'hapoalim',
    category: 'banking',
    legitDomains: ['bankhapoalim.co.il'],
  },
  {
    brand: 'discount',
    category: 'banking',
    legitDomains: ['discountbank.co.il'],
  },
  {
    brand: 'mizrahi',
    category: 'banking',
    legitDomains: ['mizrahi-tefahot.co.il'],
  },
  {
    brand: 'paypal',
    category: 'banking',
    legitDomains: ['paypal.com'],
  },
  {
    brand: 'icloud',
    category: 'technology',
    legitDomains: ['icloud.com'],
  },
  {
    brand: 'outlook',
    category: 'technology',
    legitDomains: ['outlook.com'],
  },
  {
    brand: 'office',
    category: 'technology',
    legitDomains: ['office.com'],
  },
  {
    brand: 'github',
    category: 'technology',
    legitDomains: ['github.com'],
  },
  {
    brand: 'amazon',
    category: 'shopping',
    legitDomains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazonaws.com'],
  },
  {
    brand: 'facebook',
    category: 'social',
    legitDomains: ['facebook.com', 'fb.com', 'meta.com', 'instagram.com'],
  },
  {
    brand: 'instagram',
    category: 'social',
    legitDomains: ['instagram.com'],
  },
  {
    brand: 'whatsapp',
    category: 'social',
    legitDomains: ['whatsapp.com'],
  },
  {
    brand: 'telegram',
    category: 'social',
    legitDomains: ['telegram.org'],
  },
  {
    brand: 'tiktok',
    category: 'social',
    legitDomains: ['tiktok.com'],
  },
  {
    brand: 'linkedin',
    category: 'social',
    legitDomains: ['linkedin.com'],
  },
  {
    brand: 'ebay',
    category: 'shopping',
    legitDomains: ['ebay.com'],
  },
  {
    brand: 'aliexpress',
    category: 'shopping',
    legitDomains: ['aliexpress.com'],
  },
  {
    brand: 'shein',
    category: 'shopping',
    legitDomains: ['shein.com'],
  },
  {
    brand: 'dhl',
    category: 'shopping',
    legitDomains: ['dhl.com'],
  },
  {
    brand: 'fedex',
    category: 'shopping',
    legitDomains: ['fedex.com'],
  },
  {
    brand: 'ups',
    category: 'shopping',
    legitDomains: ['ups.com'],
  },
  {
    brand: 'israelpost',
    category: 'shopping',
    legitDomains: ['israelpost.co.il'],
  },
  {
    brand: 'binance',
    category: 'crypto',
    legitDomains: ['binance.com'],
  },
  {
    brand: 'coinbase',
    category: 'crypto',
    legitDomains: ['coinbase.com'],
  },
  {
    brand: 'metamask',
    category: 'crypto',
    legitDomains: ['metamask.io'],
  },
  {
    brand: 'trustwallet',
    category: 'crypto',
    legitDomains: ['trustwallet.com'],
  },
  {
    brand: 'gov',
    category: 'government',
    legitDomains: ['gov.il'],
  },
  {
    brand: 'tax',
    category: 'government',
    legitDomains: ['tax.gov.il'],
  },
  {
    brand: 'bituachleumi',
    category: 'government',
    legitDomains: ['btl.gov.il'],
  },
];

function normalizeHost(hostname) {
  return hostname.toLowerCase().replace(/\.$/, '');
}

function isKnownShortenerUrl(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    const hostname = normalizeHost(parsed.hostname);
    const domainInfo = parseDomain(hostname, {
      allowIcannDomains: true,
      allowPrivateDomains: true,
    });
    const registrableDomain = (domainInfo.domain || hostname).toLowerCase();

    return SHORTENER_HOSTS.has(registrableDomain);
  } catch {
    return false;
  }
}

function isBitlyUrl(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    return normalizeHost(parsed.hostname) === 'bit.ly';
  } catch {
    return false;
  }
}

async function expandBitlyUrl(shortUrl) {
  const token = process.env.BITLY_ACCESS_TOKEN;

  if (!token) {
    console.log('Bitly API failed', {
      shortUrl,
      reason: 'BITLY_ACCESS_TOKEN is missing',
    });
    return null;
  }

  try {
    const parsed = new URL(shortUrl);
    const bitlink_id = `${parsed.host}${parsed.pathname}`;

    console.log('Bitly API expansion started', {
      shortUrl,
      bitlink_id,
    });

    const response = await axios.post(
      'https://api-ssl.bitly.com/v4/expand',
      { bitlink_id },
      {
        timeout: 3000,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        proxy: false,
      }
    );

    if (response.data?.long_url) {
      console.log('Bitly API success', {
        shortUrl,
        expandedUrl: response.data.long_url,
      });
      return response.data.long_url;
    }

    console.log('Bitly API failed', {
      shortUrl,
      reason: 'long_url missing in response',
      responseData: response.data || null,
    });
    return null;
  } catch (error) {
    console.log('Bitly API failed', {
      shortUrl,
      message: error.message,
      status: error.response?.status || null,
      responseData: error.response?.data || null,
    });
    return null;
  }
}

function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function shannonEntropy(text) {
  if (!text) return 0;
  const counts = new Map();
  for (const ch of text) counts.set(ch, (counts.get(ch) || 0) + 1);

  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / text.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function tokenize(value) {
  return safeDecode(value)
    .toLowerCase()
    .normalize('NFKC')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function skeleton(token) {
  return punycode
    .toUnicode(token)
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[0]/g, 'o')
    .replace(/[1|!]/g, 'l')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[^a-z0-9]/g, '');
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
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

function defaultPort(protocol) {
  return protocol === 'http:' ? '80' : protocol === 'https:' ? '443' : '';
}

function labelHasMixedScripts(label) {
  const scripts = new Set();

  for (const ch of label.normalize('NFKC')) {
    if (/\p{Script=Latin}/u.test(ch)) scripts.add('Latin');
    else if (/\p{Script=Cyrillic}/u.test(ch)) scripts.add('Cyrillic');
    else if (/\p{Script=Greek}/u.test(ch)) scripts.add('Greek');
    else if (/\p{Script=Hebrew}/u.test(ch)) scripts.add('Hebrew');
    else if (/\p{Script=Arabic}/u.test(ch)) scripts.add('Arabic');
  }

  // ערבוב סקריפטים באותה תווית שמכילה לטינית הוא דגל טוב להומוגרפים
  return scripts.size > 1 && scripts.has('Latin');
}

function detectBrandRisk(hostname, registrableDomain, brandConfig) {
  const findings = [];
  let score = 0;

  const hostTokens = tokenize(hostname.replace(/\./g, '-'));
  const registrableLabel = (registrableDomain.split('.')[0] || '').toLowerCase();

  for (const rule of brandConfig) {
    const brand = rule.brand.toLowerCase();
    const legit = new Set(rule.legitDomains.map((d) => d.toLowerCase()));
    const brandSkel = skeleton(brand);

    const hasBrandToken = hostTokens.some((t) => skeleton(t) === brandSkel);
    const rootSkeleton = skeleton(registrableLabel);

    const skeletonMatchOnRoot =
      rootSkeleton === brandSkel && registrableLabel !== brand;

    const nearMatchOnRoot =
      rootSkeleton &&
      rootSkeleton !== brandSkel &&
      levenshtein(rootSkeleton, brandSkel) === 1;

    const allowed = legit.has(registrableDomain);

    if (!allowed && hasBrandToken) {
      findings.push(
        `שם המותג "${brand}" מופיע ב-hostname, אבל הדומיין הרשום הוא "${registrableDomain}" ואינו דומיין מורשה של המותג`
      );
      score += 25;
      continue;
    }

    if (!allowed && (skeletonMatchOnRoot || nearMatchOnRoot)) {
      findings.push(
        `הדומיין הרשום "${registrableDomain}" דומה מאוד למותג "${brand}" אך אינו דומיין מורשה`
      );
      score += 30;
    }
  }

  return { findings, score };
}

function detectExternalRedirect(parsedUrl) {
  const findings = [];
  let score = 0;

  for (const [key, value] of parsedUrl.searchParams.entries()) {
    const param = key.toLowerCase();
    if (!REDIRECT_PARAMS.has(param)) continue;

    try {
      const target = new URL(value, parsedUrl.origin);
      if (target.origin !== parsedUrl.origin) {
        findings.push(
          `פרמטר ההפניה "${key}" מצביע ל-origin חיצוני: ${target.origin}`
        );
        score += 25;
      }
    } catch {
      // אם זה לא URL תקין, פשוט מדלגים
    }
  }

  return { findings, score };
}

function makeResult(base) {
  const score = Math.max(0, Math.min(base.riskScore, 100));
  const riskLevel = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return {
    ...base,
    riskScore: score,
    riskLevel,
  };
}

function analyzeUrl(rawUrl, brandConfig = BRAND_CONFIG) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return makeResult({
      input: rawUrl,
      normalizedUrl: null,
      registrableDomain: null,
      publicSuffix: null,
      subdomain: null,
      hostname: null,
      unicodeHostname: null,
      riskScore: 20,
      findings: ['כתובת URL לא תקינה או לא מלאה'],
    });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return makeResult({
      input: rawUrl,
      normalizedUrl: parsed.toString(),
      registrableDomain: null,
      publicSuffix: null,
      subdomain: null,
      hostname: parsed.hostname || null,
      unicodeHostname: parsed.hostname ? punycode.toUnicode(parsed.hostname) : null,
      riskScore: 80,
      findings: [`סכמה לא נתמכת או מסוכנת: ${parsed.protocol}`],
    });
  }

  const hostname = normalizeHost(parsed.hostname);
  const unicodeHostname = punycode.toUnicode(hostname);

  const domainInfo = parseDomain(hostname, {
    allowIcannDomains: true,
    allowPrivateDomains: true,
  });

  const registrableDomain = (domainInfo.domain || hostname).toLowerCase();
  const publicSuffix = domainInfo.publicSuffix || null;
  const subdomain = domainInfo.subdomain || '';

  const findings = [];
  let score = 0;

  const add = (points, message) => {
    score += points;
    findings.push(message);
  };

  // 1. credentials לפני ה-host
  if (parsed.username || parsed.password) {
    add(35, 'הקישור מכיל username/password לפני שם המארח');
  }

  // 2. כתובת IP במקום דומיין
  const ipCandidate = hostname.replace(/^\[|\]$/g, '');
  if (isIP(ipCandidate)) {
    add(35, 'הקישור משתמש בכתובת IP במקום בשם דומיין');
  }

  // 3. shortener
  if (SHORTENER_HOSTS.has(registrableDomain)) {
    add(12, 'הקישור מגיע משירות קיצור ולכן היעד האמיתי מוסתר בשלב הראשון');
  }

  // 4. IDN / Punycode
  if (hostname.includes('xn--')) {
    add(25, 'שם המתחם מכיל Punycode, ולכן נדרש לבדוק הומוגרפים ו-IDN');
  }

  // 5. ערבוב סקריפטים בתוך אותה תווית
  if (unicodeHostname.split('.').some(labelHasMixedScripts)) {
    add(25, 'נמצא ערבוב סקריפטים בתוך תווית אחת של הדומיין');
  }

  // 6. ריבוי תתי־דומיינים
  const subCount = subdomain ? subdomain.split('.').filter(Boolean).length : 0;
  if (subCount >= 3) {
    add(18, 'מספר חריג של תתי־דומיינים');
  }

  // 7. אורך URL
  if (rawUrl.length >= 100) {
    add(10, 'הקישור ארוך במיוחד');
  }

  // 8. אנטרופיה גבוהה ב-hostname
  const hostEntropy = shannonEntropy(hostname.replace(/\./g, ''));
  if (hostEntropy >= 3.8) {
    add(15, 'שם המארח נראה אקראי יחסית');
  }

  // 9. יחס ספרות/אותיות
  const letters = (hostname.match(/[a-z]/gi) || []).length;
  const digits = (hostname.match(/\d/g) || []).length;
  if (letters > 0 && digits / letters >= 0.3) {
    add(10, 'יחס גבוה של ספרות לאותיות בשם המתחם');
  }

  // 10. מקפים רבים בדומיין הרשום
  if ((registrableDomain.match(/-/g) || []).length >= 2) {
    add(12, 'ריבוי מקפים בדומיין הרשום');
  }

  // 11. מילים חשודות ב-path / query
  const decodedPathAndQuery = safeDecode(`${parsed.pathname}${parsed.search}`).toLowerCase();
  const foundWords = [...new Set(SUSPICIOUS_WORDS.filter((w) => decodedPathAndQuery.includes(w)))];
  if (foundWords.length > 0) {
    add(
      Math.min(20, 6 + foundWords.length * 4),
      `נמצאו מילות פיתוי/אימות בנתיב או בשאילתה: ${foundWords.join(', ')}`
    );
  }

  // 12. URL נוסף בתוך path/query או // חריג
  if (/https?:\/\//i.test(decodedPathAndQuery) || parsed.pathname.includes('//')) {
    add(15, 'הנתיב או הפרמטרים מכילים URL נוסף או // חריג');
  }

  // 13. percent-encoding משמעותי
  const percentEncodedCount = (parsed.search.match(/%[0-9a-f]{2}/gi) || []).length;
  if (percentEncodedCount >= 4 || /%25[0-9a-f]{2}/i.test(parsed.search)) {
    add(10, 'יש שימוש משמעותי בקידוד אחוזים');
  }

  // 14. מחרוזת שנראית כמו דומיין נוסף בתוך הנתיב/שאילתה
  if (/\b[a-z0-9-]+\.(?:com|net|org|co|io|gov|app|bank|edu)\b/i.test(decodedPathAndQuery)) {
    add(8, 'הנתיב או הפרמטרים מכילים מחרוזת שנראית כמו דומיין נוסף');
  }

  // 15. פורט לא רגיל
  if (parsed.port && parsed.port !== defaultPort(parsed.protocol)) {
    add(10, `נעשה שימוש בפורט לא רגיל: ${parsed.port}`);
  }

  // 16. התחזות למותג
  const brandRisk = detectBrandRisk(hostname, registrableDomain, brandConfig);
  score += brandRisk.score;
  findings.push(...brandRisk.findings);

  // 17. פרמטרי redirect החוצה
  const redirectRisk = detectExternalRedirect(parsed);
  score += redirectRisk.score;
  findings.push(...redirectRisk.findings);

  return makeResult({
    input: rawUrl,
    normalizedUrl: parsed.toString(),
    registrableDomain,
    publicSuffix,
    subdomain,
    hostname,
    unicodeHostname,
    riskScore: score,
    findings,
  });
}

// הרחבה server-side של shorteners / redirect chains.
// לא להריץ את זה בדפדפן של המשתמש.
async function expandShortUrl(inputUrl, fetchImpl = fetch, maxHops = 5) {
  if (!isKnownShortenerUrl(inputUrl)) {
    return {
      originalUrl: inputUrl,
      finalUrl: inputUrl,
      hops: [],
    };
  }

  let current = inputUrl;
  const hops = [];

  for (let i = 0; i < maxHops; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    let response;

    try {
      response = await fetchImpl(current, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
      });

      // יש אתרים שלא תומכים ב-HEAD
      if (response.status === 405 || response.status === 501) {
        response = await fetchImpl(current, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
        });
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      break;
    }

    const location = response.headers.get('location');
    if (!location) break;

    const next = new URL(location, current).toString();
    hops.push({
      status: response.status,
      from: current,
      to: next,
    });

    current = next;
  }

  return {
    originalUrl: inputUrl,
    finalUrl: current,
    hops,
  };
}

// אינטגרציה עם השכבה שכבר יש לך
async function checkUrlWithLayers(inputUrl, checkGoogleSafeBrowsing) {
  let expanded;

  try {
    expanded = await expandShortUrl(inputUrl);
  } catch {
    expanded = {
      originalUrl: inputUrl,
      finalUrl: inputUrl,
      hops: [],
    };
  }

  if (isBitlyUrl(inputUrl) && expanded.finalUrl === inputUrl) {
    const bitlyExpandedUrl = await expandBitlyUrl(inputUrl);

    if (bitlyExpandedUrl) {
      expanded = {
        originalUrl: inputUrl,
        finalUrl: bitlyExpandedUrl,
        hops: [],
      };
    } else {
      expanded = {
        ...expanded,
        expansionFinding: 'הקישור מקוצר אך לא ניתן היה לחשוף את היעד הסופי',
      };
    }
  }

  const manual = analyzeUrl(expanded.finalUrl);

  if (expanded.expansionFinding) {
    manual.findings = [...manual.findings, expanded.expansionFinding];
  }

  const googleVerdict = await checkGoogleSafeBrowsing([
    inputUrl,
    expanded.finalUrl,
  ]);

  return {
    originalUrl: inputUrl,
    expandedUrl: expanded.finalUrl,
    redirectHops: expanded.hops,
    manualAnalysis: manual,
    googleVerdict,
  };
}

module.exports = {
  analyzeUrl,
  expandShortUrl,
  checkUrlWithLayers,
};
