import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ClockIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Card from "../../components/ui/Card";

export default function History() {
  const [history] = useState([
    {
      id: 1,
      date: "2025-02-01 14:30",
      message: `הודעה חשודה לדוגמה: נא לאמת פרטים בקישור http://fake-link.com`,
      result: "suspicious",
      matchedWords: ["אמת פרטים", "קישור", "פרס לזכייה"]
    },
    {
      id: 2,
      date: "2025-02-01 10:15",
      message: `זכית בפרס! היכנס לקישור כדי לקבלו`,
      result: "suspicious",
      matchedWords: ["זכית", "קישור"]
    },
    {
      id: 3,
      date: "2025-01-30 18:45",
      message: `שלום, משלוח הוזמן ותואם. אין צורך בפעולה`,
      result: "safe",
      matchedWords: []
    },
    {
      id: 4,
      date: "2025-01-29 09:20",
      message: `תזכורת: פגישה היום בשעה 10:00`,
      result: "safe",
      matchedWords: []
    }
  ]);

  const getResultConfig = (result) => {
    return result === 'suspicious' 
      ? {
          icon: ExclamationTriangleIcon,
          text: 'חשוד',
          color: 'text-danger-600',
          bgColor: 'bg-danger-50',
          border: 'border-danger-200'
        }
      : {
          icon: ShieldCheckIcon,
          text: 'בטוח',
          color: 'text-success-600',
          bgColor: 'bg-success-50',
          border: 'border-success-200'
        };
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-blue-50 border border-blue-100">
              <ClockIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">
              היסטוריית בדיקות
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              כאן תוכל/י לראות את ההודעות שנבדקו ותוצאת הסיווג שלהן
            </p>
          </div>

          {/* History List */}
          <div className="space-y-6">
            {history.length === 0 ? (
              <Card className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  אין עדיין היסטוריה להצגה
                </h3>
                <p className="text-gray-500">
                  לאחר בדיקה ראשונה תופיע כאן הרשומה
                </p>
              </Card>
            ) : (
              history.map((item, index) => {
                const config = getResultConfig(item.result);
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Card>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Date and Status */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-start lg:justify-start lg:w-48 flex-shrink-0">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">
                              תאריך
                            </div>
                            <div className="text-gray-900 font-medium">
                              {new Date(item.date).toLocaleDateString('he-IL')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(item.date).toLocaleTimeString('he-IL', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <div className={`p-2 rounded-full border ${config.bgColor} ${config.border}`}>
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <span className={`font-medium ${config.color}`}>
                              {config.text}
                            </span>
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-500 mb-2">
                            תוכן ההודעה
                          </div>
                          <div className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 text-right">
                            {item.message}
                          </div>
                          
                          {/* Matched Words */}
                          {item.matchedWords && item.matchedWords.length > 0 && (
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

