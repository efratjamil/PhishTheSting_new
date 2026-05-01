import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowPathIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import AiChat from "../../components/ui/AiChat";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const categoryLabels = {
  urgency: "מילות לחץ ודחיפות",
  personalInfo: "בקשה למידע אישי",
  action: "הנעה לפעולה",
  bait: "מילות פיתוי",
  financial: "מונחים פיננסיים",
  technical: "מונחים טכניים ואזהרות",
};

const shortenerHosts = new Set([
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "is.gd",
  "tiny.cc",
]);

function getHostname(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isShortenedUrl(value) {
  return shortenerHosts.has(getHostname(value));
}

function extractBrandImpersonation(findings = []) {
  for (const finding of findings) {
    const tokenMatch = finding.match(/שם המותג "([^"]+)".*הדומיין הרשום הוא "([^"]+)"/);
    if (tokenMatch) {
      return {
        brand: tokenMatch[1],
        domain: tokenMatch[2],
      };
    }

    const similarMatch = finding.match(/הדומיין הרשום "([^"]+)".*למותג "([^"]+)"/);
    if (similarMatch) {
      return {
        brand: similarMatch[2],
        domain: similarMatch[1],
      };
    }
  }

  return null;
}

function formatBrandName(brand = "") {
  return brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : "";
}

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedLinks, setExpandedLinks] = useState({});

  const {
    analysis = {},
    summary = "",
    textAnalysis = false,
    urlAnalysis = false,
    originalMessage = "",
    extractedUrls = [],
    urlThreats = [],
    apiError,
  } = location.state || {};

  const isSuspicious = Boolean(textAnalysis || urlAnalysis);
  const flaggedLinks = Array.isArray(urlThreats) ? urlThreats : [];
  const analysisEntries = Object.entries(analysis);

  const shortenedThreat = flaggedLinks.find((item) =>
    isShortenedUrl(item?.originalUrl || item?.url || ""),
  );
  const brandThreat = flaggedLinks.find((item) =>
    Boolean(extractBrandImpersonation(item?.manualAnalysis?.findings || [])),
  );

  const alertContent = useMemo(() => {
    if (!isSuspicious) {
      return {
        title: "לא זוהו סימנים חשודים",
        description:
          "לא נמצאו התאמות חשודות בתוכן או בקישורים. עדיין מומלץ לשמור על ערנות ולהימנע מלחיצה על קישורים לא מוכרים.",
      };
    }

    if (shortenedThreat && brandThreat) {
      const impersonation = extractBrandImpersonation(
        brandThreat.manualAnalysis?.findings || [],
      );

      return {
        title: "⚠️ זוהה ניסיון פישינג",
        description: `הקישור בהודעה הוא קישור מקוצר שהוביל ליעד חשוד, ונראה כהתחזות ל־${formatBrandName(
          impersonation?.brand || "מותג מוכר",
        )}.`,
      };
    }

    if (brandThreat) {
      const impersonation = extractBrandImpersonation(
        brandThreat.manualAnalysis?.findings || [],
      );

      return {
        title: "⚠️ זוהה ניסיון פישינג",
        description: `הקישור שנבדק נראה כהתחזות ל־${formatBrandName(
          impersonation?.brand || "מותג מוכר",
        )}. אין ללחוץ עליו או למסור פרטים.`,
      };
    }

    if (shortenedThreat) {
      return {
        title: "⚠️ זוהה ניסיון פישינג",
        description:
          "הקישור בהודעה הוא קישור מקוצר שהוביל ליעד חשוד. אין ללחוץ עליו או להמשיך ליעד שהוסתר.",
      };
    }

    return {
      title: "⚠️ זוהה ניסיון פישינג",
      description:
        "זוהו סימנים ברורים של ניסיון פישינג בתוכן או בקישורים. אין ללחוץ על קישורים או למסור פרטים.",
    };
  }, [brandThreat, isSuspicious, shortenedThreat]);

  const recommendations = isSuspicious
    ? [
        "אל תמסור פרטים אישיים או סיסמאות.",
        "אל תלחץ על קישורים או קבצים לא מזוהים.",
        "בדוק את כתובת השולח והאם יש שגיאות כתיב.",
        "אם צריך, דווח על ההודעה לגורם אבטחה או למנהל.",
      ]
    : [
        "לא זוהתה אינדיקציה ברורה לסיכון, אבל כדאי להישאר זהירים.",
        "בדוק תמיד את מקור ההודעה לפני לחיצה על קישור.",
        "הימנע ממסירת פרטים אישיים דרך הודעות לא צפויות.",
      ];

  const toggleLinkDetails = (url) => {
    setExpandedLinks((current) => ({
      ...current,
      [url]: !current[url],
    }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-5xl items-center">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border ${
                  isSuspicious
                    ? "border-danger-200 bg-danger-50"
                    : "border-success-200 bg-success-50"
                }`}
              >
                {isSuspicious ? (
                  <ExclamationTriangleIcon className="h-8 w-8 text-danger-600" />
                ) : (
                  <ShieldCheckIcon className="h-8 w-8 text-success-600" />
                )}
              </motion.div>

              <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                תוצאות הבדיקה
              </h1>
            </div>

            <div className="mb-5">
              <Alert
                type={isSuspicious ? "error" : "success"}
                title={alertContent.title}
                className="px-4 py-3"
              >
                {alertContent.description}
              </Alert>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <Card className="h-full" padding="p-5">
                  <h2 className="mb-4 flex items-center space-x-3 text-lg font-semibold text-gray-900 rtl:space-x-reverse lg:text-xl">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    <span>פרטי הניתוח</span>
                  </h2>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      {summary && (
                        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                          <p className="text-sm font-medium">הסבר</p>
                          <p className="mt-1 text-sm leading-6">{summary}</p>
                        </div>
                      )}

                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-gray-900">תוכן ההודעה</span>
                        <span
                          className={`rounded-full border px-3 py-1 text-sm font-medium ${
                            textAnalysis
                              ? "border-danger-200 bg-danger-50 text-danger-600"
                              : "border-success-200 bg-success-50 text-success-600"
                          }`}
                        >
                          {textAnalysis ? "חשוד" : "תקין"}
                        </span>
                      </div>

                      {analysisEntries.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {analysisEntries.map(([category, words]) => (
                            <div key={category}>
                              <p className="mb-2 text-sm font-medium text-gray-700">
                                {categoryLabels[category] || category}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {words.map((word, index) => (
                                  <span
                                    key={`${category}-${word}-${index}`}
                                    className="rounded border border-danger-200 bg-danger-50 px-2 py-1 text-sm text-danger-700"
                                  >
                                    {word}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-gray-500">
                          לא נמצאו ביטויים חשודים בתוכן ההודעה.
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">קישורים</span>
                        <span
                          className={`rounded-full border px-3 py-1 text-sm font-medium ${
                            urlAnalysis
                              ? "border-danger-200 bg-danger-50 text-danger-600"
                              : "border-success-200 bg-success-50 text-success-600"
                          }`}
                        >
                          {urlAnalysis ? "חשוד" : "תקין"}
                        </span>
                      </div>

                      {extractedUrls.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {extractedUrls.map((url, index) => {
                            const flagged = flaggedLinks.find((item) => item.url === url);
                            const isExpanded = Boolean(expandedLinks[url]);
                            const isShortened = flagged
                              ? isShortenedUrl(flagged.originalUrl || url)
                              : false;
                            const impersonation = flagged
                              ? extractBrandImpersonation(
                                  flagged.manualAnalysis?.findings || [],
                                )
                              : null;
                            const finalDestination =
                              flagged?.expandedUrl && flagged.expandedUrl !== flagged.originalUrl
                                ? flagged.expandedUrl
                                : "";

                            return (
                              <div
                                key={`${url}-${index}`}
                                className="rounded border border-gray-200 bg-white px-3 py-2 text-sm"
                              >
                                <div className="flex flex-col gap-2">
                                  {flagged && isShortened && (
                                    <div className="text-xs font-medium text-amber-700">
                                      🔗 קישור מקוצר זוהה
                                    </div>
                                  )}

                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="break-all text-gray-800">{url}</div>

                                      {flagged ? (
                                        <div className="mt-1 space-y-1.5">
                                          <p className="text-danger-600">
                                            ⚠️ הקישור מסתיר יעד אמיתי ונמצא חשוד
                                          </p>

                                          {finalDestination && (
                                            <p className="break-all text-gray-700">
                                              הקישור מוביל ל:{" "}
                                              <span className="font-medium">
                                                {finalDestination.replace(/^https?:\/\//i, "")}
                                              </span>
                                            </p>
                                          )}

                                          {impersonation && (
                                            <p className="text-danger-700">
                                              ⚠️ התחזות ל־
                                              {formatBrandName(impersonation.brand)}{" "}
                                              (דומיין אמיתי: {impersonation.domain})
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="mt-1 text-success-600">
                                          לא זוהה כאיום
                                        </div>
                                      )}
                                    </div>

                                    <span
                                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                        flagged
                                          ? "border-danger-200 bg-danger-50 text-danger-600"
                                          : "border-success-200 bg-success-50 text-success-600"
                                      }`}
                                    >
                                      {flagged ? "חשוד" : "תקין"}
                                    </span>
                                  </div>

                                  {flagged && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => toggleLinkDetails(url)}
                                        className="w-fit text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                                      >
                                        {isExpanded ? "הסתר פרטים" : "פרטים נוספים"}
                                      </button>

                                      <AnimatePresence initial={false}>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="overflow-hidden"
                                          >
                                            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                                              <div className="space-y-3 text-xs text-gray-700">
                                                {finalDestination && (
                                                  <div>
                                                    <p className="mb-1 font-semibold">יעד שנחשף</p>
                                                    <p className="break-all">{flagged.expandedUrl}</p>
                                                  </div>
                                                )}

                                                <div>
                                                  <p className="mb-1 font-semibold">סיבות לזיהוי</p>
                                                  <ul className="list-disc space-y-1 pr-4">
                                                    {(flagged.manualAnalysis?.findings || []).map(
                                                      (finding, findingIndex) => (
                                                        <li key={`${url}-finding-${findingIndex}`}>
                                                          {finding}
                                                        </li>
                                                      ),
                                                    )}
                                                  </ul>
                                                </div>

                                                <div>
                                                  <p className="mb-1 font-semibold">שכבות הזיהוי</p>
                                                  <ul className="list-disc space-y-1 pr-4">
                                                    <li>
                                                      {isShortened
                                                        ? "Bitly expansion: בוצע ניסיון לחשוף את היעד המקוצר."
                                                        : "Bitly expansion: לא נדרש עבור קישור שאינו מקוצר."}
                                                    </li>
                                                    <li>
                                                      manual analysis: רמת הסיכון שזוהתה היא{" "}
                                                      {flagged.manualAnalysis?.riskLevel || "לא זוהתה"}.
                                                    </li>
                                                    <li>
                                                      Google Safe Browsing:{" "}
                                                      {flagged.googleVerdict?.safe === false
                                                        ? `זוהו איומים (${(flagged.googleVerdict?.threats || []).join(", ")})`
                                                        : "לא זוהה איום בשירות."}
                                                    </li>
                                                  </ul>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-gray-500">
                          לא נמצאו קישורים בהודעה.
                        </p>
                      )}

                      {apiError && (
                        <p className="mt-3 text-sm text-gray-500">
                          בדיקת הקישור נכשלה, ולכן לא התקבלה תוצאה מלאה מהשירות.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <div className="space-y-4">
                  <Card padding="p-5">
                    <h2 className="mb-4 flex items-center space-x-3 text-lg font-semibold text-gray-900 rtl:space-x-reverse lg:text-xl">
                      <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                      <span>המלצות</span>
                    </h2>

                    <ul className="space-y-2.5 text-right">
                      {recommendations.map((recommendation, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.65 + index * 0.08, duration: 0.45 }}
                          className="flex items-start space-x-3 rtl:space-x-reverse"
                        >
                          <span
                            className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${
                              isSuspicious ? "bg-danger-600" : "bg-success-600"
                            }`}
                          ></span>
                          <span className="text-sm text-gray-700 lg:text-base">
                            {recommendation}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </Card>

                  <AiChat
                    sourceMessage={originalMessage}
                    analysisPayload={{
                      summary,
                      textAnalysis,
                      urlAnalysis,
                      categories: analysis,
                      links: flaggedLinks,
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8 }}
              className="mt-5 text-center"
            >
              <Button
                onClick={() => navigate("/analyze")}
                size="lg"
                className="shadow-glow px-6 py-2.5"
              >
                <ArrowPathIcon className="ml-2 h-5 w-5" />
                ניתוח חדש
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
