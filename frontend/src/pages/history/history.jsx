import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.id) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/analyze/history/${user.id}`
        );
        setHistory(data.items || []);
      } catch (err) {
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
    return {
      id: item._id,
      date: item.createdAt,
      message: item.message,
      result: suspicious ? "suspicious" : "safe",
      matchedWords: item.matchedWords || [],
      extractedUrls: item.extractedUrls || [],
    };
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
    </div>
  );
}
