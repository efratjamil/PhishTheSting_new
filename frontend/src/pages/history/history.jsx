import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import {
  clearAuthSession,
  getAuthHeaders,
  getStoredUser,
} from "../../utils/auth";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLinks, setExpandedLinks] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const navigate = useNavigate();

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
    "did.li",
    "s.id",
  ]);

  const getHostname = (value) => {
    try {
      return new URL(value).hostname.toLowerCase();
    } catch {
      return "";
    }
  };

  const isShortenedUrl = (value) => shortenerHosts.has(getHostname(value));

  const extractBrandImpersonation = (findings = []) => {
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
  };

  const formatBrandName = (brand = "") =>
    brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : "";

  useEffect(() => {
    const user = getStoredUser();

    if (!user?.id) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/analyze/history",
          {
            headers: getAuthHeaders(),
          }
        );
        setHistory(data.items || []);
      } catch (err) {
        if (err.response?.status === 401) {
          clearAuthSession();
          navigate("/login");
          return;
        }

        setError(err.response?.data?.error || "שגיאה בטעינת ההיסטוריה");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const getResultConfig = (result) => {
    return result === "suspicious"
      ? {
          icon: ExclamationTriangleIcon,
          text: "חשוד",
          color: "text-danger-600",
          bgColor: "bg-danger-50",
          border: "border-danger-200",
        }
      : {
          icon: ShieldCheckIcon,
          text: "בטוח",
          color: "text-success-600",
          bgColor: "bg-success-50",
          border: "border-success-200",
        };
  };

  const mapHistoryItem = (item) => {
    const suspicious = Boolean(item.textAnalysis || item.urlAnalysis);
    const checkedLinks = Array.isArray(item.checkedLinks)
      ? item.checkedLinks
      : Array.isArray(item.urlThreats)
        ? item.urlThreats.map((link) => ({
            url: link.url,
            safe: typeof link.safe === "boolean" ? link.safe : false,
            threats: link.threats || [],
            originalUrl: link.originalUrl || link.url,
            expandedUrl: link.expandedUrl || link.url,
            redirectHops: link.redirectHops || [],
            manualAnalysis: link.manualAnalysis || null,
            googleVerdict: link.googleVerdict || null,
          }))
        : [];

    return {
      id: item._id,
      date: item.createdAt,
      message: item.message,
      summary: item.summary || "",
      result: suspicious ? "suspicious" : "safe",
      matchedWords: item.matchedWords || [],
      extractedUrls: item.extractedUrls || [],
      checkedLinks,
    };
  };

  const toggleLinkDetails = (historyId, url) => {
    const key = `${historyId}-${url}`;
    setExpandedLinks((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleDeleteItem = async (historyId) => {
    setDeletingId(historyId);
    setError(null);

    try {
      await axios.delete(`http://localhost:5000/api/analyze/history/${historyId}`, {
        headers: getAuthHeaders(),
      });

      setHistory((current) => current.filter((item) => item._id !== historyId));
      setExpandedLinks((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([key]) => !key.startsWith(`${historyId}-`)),
        ),
      );
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuthSession();
        navigate("/login");
        return;
      }

      setError(err.response?.data?.error || "שגיאה במחיקת ההודעה");
    } finally {
      setDeletingId(null);
      setConfirmDeleteItem(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-blue-50 border border-blue-100">
              <ClockIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">
              היסטוריית בדיקות
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              כאן אפשר לראות את כל החיפושים והבדיקות שביצעת
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <div className="space-y-6">
            {history.length === 0 ? (
              <Card className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  עדיין אין היסטוריה להצגה
                </h3>
                <p className="text-gray-500">
                  אחרי הבדיקה הראשונה שלך היא תופיע כאן
                </p>
              </Card>
            ) : (
              history.map((rawItem, index) => {
                const item = mapHistoryItem(rawItem);
                const config = getResultConfig(item.result);
                const Icon = config.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                  >
                    <Card>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex items-center justify-between lg:flex-col lg:items-start lg:justify-start lg:w-48 flex-shrink-0">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">תאריך</div>
                            <div className="text-gray-900 font-medium">
                              {new Date(item.date).toLocaleDateString("he-IL")}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(item.date).toLocaleTimeString("he-IL", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <div
                              className={`p-2 rounded-full border ${config.bgColor} ${config.border}`}
                            >
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <span className={`font-medium ${config.color}`}>
                              {config.text}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteItem(item)}
                            disabled={deletingId === item.id}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <TrashIcon className="h-4 w-4 text-black" />
                            {deletingId === item.id ? "מוחק..." : "מחק"}
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-500 mb-2">תוכן ההודעה</div>
                          <div className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 text-right whitespace-pre-wrap break-words">
                            {item.message}
                          </div>

                          {item.extractedUrls.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-500 mb-2">קישורים שנמצאו:</div>
                              <div className="flex flex-col gap-2">
                                {item.extractedUrls.map((url, urlIndex) => (
                                  <div
                                    key={`${item.id}-url-${urlIndex}`}
                                    className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 break-all"
                                  >
                                    {url}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.matchedWords.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-500 mb-2">
                                מילות אזהרה שזוהו:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {item.matchedWords.map((word, wordIndex) => (
                                  <span
                                    key={wordIndex}
                                    className="px-2 py-1 bg-danger-50 text-danger-700 border border-danger-200 rounded text-sm"
                                  >
                                    {word}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.checkedLinks.length > 0 && (
                            <div className="mt-4">
                              <div className="mb-2 text-sm text-gray-500">
                                קישורים שנבדקו:
                              </div>
                              <div className="space-y-2">
                                {item.checkedLinks.map((link, linkIndex) => {
                                  const detailKey = `${item.id}-${link.url}-${linkIndex}`;
                                  const isExpanded = Boolean(expandedLinks[detailKey]);
                                  const impersonation = extractBrandImpersonation(
                                    link.manualAnalysis?.findings || [],
                                  );
                                  const shortReason = impersonation
                                    ? "חשד להתחזות למותג"
                                    : isShortenedUrl(link.originalUrl || link.url)
                                      ? "קישור מקוצר זוהה"
                                      : link.manualAnalysis?.registrableDomain
                                        ? `דומיין אמיתי: ${link.manualAnalysis.registrableDomain}`
                                        : link.safe
                                          ? "הקישור נבדק ולא זוהה כאיום"
                                          : "הקישור סומן כחשוד";

                                  return (
                                    <div
                                      key={detailKey}
                                      className="rounded-lg border border-gray-200 bg-white px-3 py-3"
                                    >
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0 flex-1">
                                            <div className="break-all text-sm text-gray-800">
                                              {link.originalUrl || link.url}
                                            </div>
                                            {link.expandedUrl &&
                                              link.expandedUrl !== link.originalUrl && (
                                                <div className="mt-1 break-all text-xs text-gray-600">
                                                  היעד שנחשף: {link.expandedUrl}
                                                </div>
                                              )}
                                            <div
                                              className={`mt-1 text-xs ${
                                                link.safe
                                                  ? "text-success-600"
                                                  : "text-danger-600"
                                              }`}
                                            >
                                              {shortReason}
                                            </div>
                                            {!link.safe && impersonation && (
                                              <div className="mt-1 text-xs text-danger-700">
                                                התחזות ל־{formatBrandName(impersonation.brand)}{" "}
                                                (דומיין אמיתי: {impersonation.domain})
                                              </div>
                                            )}
                                          </div>

                                          <span
                                            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                              link.safe
                                                ? "border-success-200 bg-success-50 text-success-600"
                                                : "border-danger-200 bg-danger-50 text-danger-600"
                                            }`}
                                          >
                                            {link.safe ? "תקין" : "חשוד"}
                                          </span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleLinkDetails(item.id, `${link.url}-${linkIndex}`)
                                          }
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
                                                  {!!(link.manualAnalysis?.findings || []).length && (
                                                    <div>
                                                      <p className="mb-1 font-semibold">
                                                        סיבות לזיהוי
                                                      </p>
                                                      <ul className="list-disc space-y-1 pr-4">
                                                        {link.manualAnalysis.findings.map(
                                                          (finding, findingIndex) => (
                                                            <li
                                                              key={`${detailKey}-finding-${findingIndex}`}
                                                            >
                                                              {finding}
                                                            </li>
                                                          ),
                                                        )}
                                                      </ul>
                                                    </div>
                                                  )}

                                                  {!!(link.threats || []).length && (
                                                    <div>
                                                      <p className="mb-1 font-semibold">איומים</p>
                                                      <ul className="list-disc space-y-1 pr-4">
                                                        {link.threats.map((threat, threatIndex) => (
                                                          <li
                                                            key={`${detailKey}-threat-${threatIndex}`}
                                                          >
                                                            {threat}
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    </div>
                                                  )}

                                                  <div>
                                                    <p className="mb-1 font-semibold">
                                                      Google Safe Browsing
                                                    </p>
                                                    <p>
                                                      {link.googleVerdict?.safe === false
                                                        ? "זוהה איום בשירות"
                                                        : "לא זוהה איום בשירות"}
                                                    </p>
                                                  </div>

                                                  {link.expandedUrl &&
                                                    link.expandedUrl !== link.originalUrl && (
                                                      <div>
                                                        <p className="mb-1 font-semibold">
                                                          קישור סופי
                                                        </p>
                                                        <p className="break-all">
                                                          {link.expandedUrl}
                                                        </p>
                                                      </div>
                                                    )}
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {confirmDeleteItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              dir="rtl"
            >
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                האם את/ה בטוח/ה?
              </h3>
              <p className="mb-5 text-sm leading-6 text-gray-600">
                הודעה זו תימחק מהאזור האישי ולא תופיע יותר בהיסטוריית הבדיקות.
              </p>
              <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
                {confirmDeleteItem.message}
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteItem(null)}
                  disabled={deletingId === confirmDeleteItem.id}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(confirmDeleteItem.id)}
                  disabled={deletingId === confirmDeleteItem.id}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4 text-white" />
                  {deletingId === confirmDeleteItem.id ? "מוחק..." : "כן, מחק"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
