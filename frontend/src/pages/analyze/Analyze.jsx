import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import { getAuthHeaders, getStoredUser } from "../../utils/auth";
import { API_BASE_URL } from "../../config/apiConfig";

const findUrlLikeSegments = (text) => {
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
};

const extractUrls = (text) => {
  const matches = findUrlLikeSegments(text).map((segment) => segment.value);
  const normalizedUrls = matches.map((url) =>
    /^https?:\/\//i.test(url) ? url : `https://${url}`,
  );

  return [...new Set(normalizedUrls)];
};

const isFlaggedLink = (link = {}) => {
  if (!link || typeof link !== "object") {
    return false;
  }

  if (link.safetyStatus === "unknown") {
    return false;
  }

  if (link.marketingClassification?.isLegitimateMarketing === true) {
    return false;
  }

  if (link.safe === false || link.manualUnsafe === true) {
    return true;
  }

  const ssl = link.sslCertificate || {};
  if (ssl.hasHttps === false) return true;
  if (ssl.hasCertificate === false) return true;
  if (ssl.certificateValid === false || ssl.isExpired === true) return true;
  if (ssl.hostnameMatchesCertificate === false) return true;

  return link.googleVerdict?.safe === false;
};

export default function Analyze() {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!message.trim()) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const user = getStoredUser();

      const textResponse = await axios.post(
        `${API_BASE_URL}/api/analyze`,
        {
          message,
        },
        {
          headers: getAuthHeaders(),
        },
      );
      const analysis = textResponse.data.analysis || {};
      const summary = textResponse.data.summary || "";
      const extractedUrls = extractUrls(message);

      let urlAnalysis = false;
      let urlCaution = false;
      let urlThreats = [];
      let checkedLinks = [];

      if (extractedUrls.length > 0) {
        const responses = await Promise.all(
          extractedUrls.map((url) =>
            axios.post(
              `${API_BASE_URL}/api/links/check-safety`,
              {
                url,
                messageText: message,
                extractedUrls,
              },
              {
                headers: getAuthHeaders(),
              },
            ),
          ),
        );

        checkedLinks = responses.map((response, index) => ({
          url: extractedUrls[index],
          safe: response.data.safe,
          safetyStatus: response.data.safetyStatus || "unknown",
          manualUnsafe: response.data.manualUnsafe === true,
          threats: response.data.threats || [],
          originalUrl: response.data.originalUrl || extractedUrls[index],
          expandedUrl: response.data.expandedUrl || extractedUrls[index],
          redirectHops: response.data.redirectHops || [],
          manualAnalysis: response.data.manualAnalysis
            ? {
                riskLevel: response.data.manualAnalysis.riskLevel || "",
                riskScore: response.data.manualAnalysis.riskScore ?? null,
                registrableDomain:
                  response.data.manualAnalysis.registrableDomain || "",
                hostname: response.data.manualAnalysis.hostname || "",
                findings: response.data.manualAnalysis.findings || [],
              }
            : null,
          googleVerdict: response.data.googleVerdict || null,
          sslCertificate: response.data.sslCertificate || null,
          marketingClassification:
            response.data.marketingClassification || null,
        }));

        urlThreats = checkedLinks.filter((result) => isFlaggedLink(result));

        urlAnalysis = urlThreats.length > 0;
        urlCaution = checkedLinks.some(
          (link) => link.safetyStatus === "unknown",
        );
      }

      const legitimateMarketing =
        checkedLinks.length > 0 &&
        checkedLinks.every(
          (link) =>
            link.marketingClassification?.isLegitimateMarketing === true,
        ) &&
        !urlAnalysis &&
        !urlCaution;
      const finalAnalysis = legitimateMarketing ? {} : analysis;
      const finalSummary = legitimateMarketing
        ? "זוהתה הודעה שיווקית לגיטימית: המותג תואם ליעד הקישור, ולא זוהתה בקשה למידע רגיש."
        : summary;
      const finalTextAnalysis = Object.keys(finalAnalysis).length > 0;
      const finalSafe = !(finalTextAnalysis || urlAnalysis || urlCaution);
      const finalStatus = finalSafe
        ? "safe"
        : urlCaution && !finalTextAnalysis && !urlAnalysis
          ? "caution"
          : "suspicious";

      if (user?.id) {
        try {
          await axios.post(
            `${API_BASE_URL}/api/analyze/history`,
            {
              message,
              summary: finalSummary,
              analysis: finalAnalysis,
              textAnalysis: finalTextAnalysis,
              safe: finalSafe,
              status: finalStatus,
              extractedUrls,
              urlAnalysis,
              urlCaution,
              checkedLinks,
              urlThreats,
            },
            {
              headers: getAuthHeaders(),
            },
          );
        } catch {
          // Saving history must not block the analysis result.
        }
      }

      navigate("/result", {
        state: {
          analysis: finalAnalysis,
          summary: finalSummary,
          textAnalysis: finalTextAnalysis,
          urlAnalysis,
          urlCaution,
          legitimateMarketing,
          originalMessage: message,
          extractedUrls,
          checkedLinks,
          urlThreats,
        },
      });
    } catch (err) {
      navigate("/result", {
        state: {
          analysis: {},
          summary: "",
          textAnalysis: false,
          urlAnalysis: false,
          originalMessage: message,
          extractedUrls: extractUrls(message),
          checkedLinks: [],
          urlThreats: [],
          apiError: err.response?.data?.error || err.message,
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMessageKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleAnalyze();
  };

  const exampleMessages = [
    "חשבונך עלול להיחסם, אשר פרטי תשלום כאן",
    "ברכות! זכית בהגרלה. לחץ כאן לקבלת הפרס",
    "עדכון אבטחה נדרש - הכנס סיסמה חדשה",
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-5xl items-center">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 text-center"
          >
            <div className="mb-3 flex justify-center">
              <div className="rounded-full border border-blue-100 bg-blue-50 p-2.5">
                <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
              נתח הודעה חשודה
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
              הדבק את ההודעה שקיבלת ונבדוק אם היא מכילה סימנים של הונאת פישינג
            </p>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.95fr)]">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg lg:p-6">
                  <div className="mb-4 flex items-center space-x-3 rtl:space-x-reverse">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900 lg:text-xl">
                      הדבק את ההודעה כאן
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleMessageKeyDown}
                        placeholder="הדבק כאן את ההודעה שקיבלת (אימייל, SMS, WhatsApp וכו')..."
                        className="h-28 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors duration-200 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 md:h-32"
                        dir="rtl"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {message.length} תווים
                        </span>
                        {message.length > 0 && (
                          <button
                            onClick={() => setMessage("")}
                            className="text-sm text-gray-500 transition-colors hover:text-gray-700"
                          >
                            נקה
                          </button>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleAnalyze}
                      disabled={!message.trim() || isAnalyzing}
                      loading={isAnalyzing}
                      size="lg"
                      className="w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
                    >
                      {isAnalyzing ? "מנתח..." : "נתח הודעה"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
                  <div className="mb-5 flex items-center space-x-3 rtl:space-x-reverse">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      טיפים ודוגמאות
                    </h3>
                  </div>

                  <div className="mb-5">
                    <h4 className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-800">
                      <span>טיפים לאבטחה</span>
                      <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                    </h4>
                    <ul className="space-y-2.5 text-sm text-gray-600">
                      <li className="flex items-start space-x-2 rtl:space-x-reverse">
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                        <span>בדוק את כתובת השולח</span>
                      </li>
                      <li className="flex items-start space-x-2 rtl:space-x-reverse">
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                        <span>אל תלחץ על קישורים חשודים</span>
                      </li>
                      <li className="flex items-start space-x-2 rtl:space-x-reverse">
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                        <span>אמת מידע דרך ערוצים רשמיים</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-800">
                      <span>דוגמאות להודעות חשודות</span>
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                    </h4>
                    <div className="space-y-2">
                      {exampleMessages.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setMessage(example)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-right text-sm text-gray-700 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
