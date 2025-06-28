import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function Analyze() {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!message.trim()) {
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      const suspiciousWords = [
        "סיסמה", "לחץ כאן", "פרטי אשראי", "קישור", "אימות", "זיהוי",
        "בהול", "נחסם", "אשר", "שלם", "עדכן", "קבל", "שלח", "מבצע",
        "זכית", "חינם", "החזר", "אזהרה", "סכנה", "תמיכה טכנית"
      ];

      const matchedWords = suspiciousWords.filter(word => message.includes(word));
      const isSuspicious = matchedWords.length > 0;

      setIsAnalyzing(false);
      navigate("/result", { 
        state: { 
          textAnalysis: isSuspicious,
          matchedWords,
          originalMessage: message
        } 
      });
    }, 2000);
  };

  const exampleMessages = [
    "חשבונך עלול להיחסם, אשר פרטי תשלום כאן",
    "ברכות! זכית בהגרלה. לחץ כאן לקבלת הפרס",
    "עדכון אבטחה נדרש - הכנס סיסמה חדשה"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-600/20 rounded-full">
              <MagnifyingGlassIcon className="w-12 h-12 text-primary-400" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
            נתח הודעה חשודה
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            הדבק את ההודעה שקיבלת ונבדוק אם היא מכילה סימנים של הונאת פישינג
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Analysis Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Card className="card-dark">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                  <DocumentTextIcon className="w-6 h-6 text-primary-400" />
                  <h2 className="text-xl font-semibold text-white">
                    הדבק את ההודעה כאן
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="הדבק כאן את ההודעה שקיבלת (אימייל, SMS, WhatsApp וכו')..."
                      className="w-full h-40 px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                      dir="rtl"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-neutral-400">
                        {message.length} תווים
                      </span>
                      {message.length > 0 && (
                        <button
                          onClick={() => setMessage("")}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
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
                    className="w-full shadow-glow"
                  >
                    {isAnalyzing ? "מנתח..." : "נתח הודעה"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Tips */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Card className="card-dark">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-success-400" />
                  <h3 className="text-lg font-semibold text-white">
                    טיפי אבטחה
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-neutral-300">
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-success-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>בדוק את כתובת השולח</span>
                  </li>
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-success-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>אל תלחץ על קישורים חשודים</span>
                  </li>
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <span className="w-2 h-2 bg-success-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>אמת מידע דרך ערוצים רשמיים</span>
                  </li>
                </ul>
              </Card>
            </motion.div>

            {/* Example Messages */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Card className="card-dark">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-warning-400" />
                  <h3 className="text-lg font-semibold text-white">
                    דוגמאות להודעות חשודות
                  </h3>
                </div>
                <div className="space-y-3">
                  {exampleMessages.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(example)}
                      className="w-full text-right p-3 bg-neutral-700/50 hover:bg-neutral-700 rounded-lg text-sm text-neutral-300 hover:text-white transition-colors duration-200 border border-neutral-600/50 hover:border-neutral-500"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}