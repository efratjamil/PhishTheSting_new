import React, { useState } from "react";
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

const extractUrls = (text) => {
  const matches = text.match(/https?:\/\/[^\s]+/gi) || [];
  return [...new Set(matches)];
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
      const user = JSON.parse(localStorage.getItem("user") || "null");

      const textResponse = await axios.post("http://localhost:5000/api/analyze", {
        message,
      });
      console.log("/api/analyze response:", textResponse.data);

      const analysis = textResponse.data.analysis || {};
      const summary = textResponse.data.summary || "";
      const hasTextFindings = Object.keys(analysis).length > 0;
      const extractedUrls = extractUrls(message);

      let urlAnalysis = false;
      let urlThreats = [];

      if (extractedUrls.length > 0) {
        const responses = await Promise.all(
          extractedUrls.map((url) =>
            axios.post("http://localhost:5000/api/links/check-safety", { url })
          )
        );

        console.log(
          "/api/links/check-safety responses:",
          responses.map((response) => response.data)
        );

        urlThreats = responses
          .map((response, index) => ({
            url: extractedUrls[index],
            safe: response.data.safe,
            threats: response.data.threats || [],
          }))
          .filter((result) => result.safe === false);

        urlAnalysis = urlThreats.length > 0;
      }

      if (user?.id) {
        try {
          await axios.post("http://localhost:5000/api/analyze/history", {
            userId: user.id,
            message,
            analysis,
            textAnalysis: hasTextFindings,
            extractedUrls,
            urlAnalysis,
            urlThreats,
          });
        } catch (historyError) {
          console.error(
            "Failed to save history to backend:",
            historyError.response?.data || historyError.message
          );
        }
      }

      navigate("/result", {
        state: {
          analysis,
          summary,
          textAnalysis: hasTextFindings,
          urlAnalysis,
          originalMessage: message,
          extractedUrls,
          urlThreats,
        },
      });
    } catch (err) {
      console.error("Analyze flow error:", err.response?.data || err.message);

      navigate("/result", {
        state: {
          analysis: {},
          summary: "",
          textAnalysis: false,
          urlAnalysis: false,
          originalMessage: message,
          extractedUrls: extractUrls(message),
          urlThreats: [],
          apiError: err.response?.data?.error || err.message,
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exampleMessages = [
    "חשבונך עלול להיחסם, אשר פרטי תשלום כאן",
    "ברכות! זכית בהגרלה. לחץ כאן לקבלת הפרס",
    "עדכון אבטחה נדרש - הכנס סיסמה חדשה",
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-50 rounded-full border border-blue-100">
              <MagnifyingGlassIcon className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            נתח הודעה חשודה
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            הדבק את ההודעה שקיבלת ונבדוק אם היא מכילה סימנים של הונאת פישינג
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    הדבק את ההודעה כאן
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="הדבק כאן את ההודעה שקיבלת (אימייל, SMS, WhatsApp וכו')..."
                      className="w-full h-40 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                      dir="rtl"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {message.length} תווים
                      </span>
                      {message.length > 0 && (
                        <button
                          onClick={() => setMessage("")}
                          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isAnalyzing ? "מנתח..." : "נתח הודעה"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    טיפים לאבטחה
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>בדוק את כתובת השולח</span>
                  </li>
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>אל תלחץ על קישורים חשודים</span>
                  </li>
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>אמת מידע דרך ערוצים רשמיים</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    דוגמאות להודעות חשודות
                  </h3>
                </div>
                <div className="space-y-3">
                  {exampleMessages.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(example)}
                      className="w-full text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
