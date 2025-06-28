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
      message: "חשבונך עלול להיחסם, אשר פרטי תשלום כאן: http://fake-link.com",
      result: "suspicious",
      matchedWords: ["חשבונך", "אשר", "פרטי תשלום"]
    },
    {
      id: 2,
      date: "2025-02-01 10:15",
      message: "ברכות! זכית בהגרלה. לחץ כאן לקבלת הפרס: http://winfree.com",
      result: "suspicious",
      matchedWords: ["זכית", "לחץ כאן"]
    },
    {
      id: 3,
      date: "2025-01-30 18:45",
      message: "שלום, נשלחה לך חבילה מ-DHL. עקוב אחרי המשלוח כאן.",
      result: "safe",
      matchedWords: []
    },
    {
      id: 4,
      date: "2025-01-29 09:20",
      message: "תזכורת: פגישה מחר בשעה 10:00",
      result: "safe",
      matchedWords: []
    }
  ]);

  const getResultConfig = (result) => {
    return result === 'suspicious' 
      ? {
          icon: ExclamationTriangleIcon,
          text: 'חשוד',
          color: 'text-danger-400',
          bgColor: 'bg-danger-600/20'
        }
      : {
          icon: ShieldCheckIcon,
          text: 'בטוח',
          color: 'text-success-400',
          bgColor: 'bg-success-600/20'
        };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="w-10 h-10 text-primary-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              היסטוריית החיפושים
            </h1>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              כל ההודעות שניתחת בעבר ותוצאות הבדיקה שלהן
            </p>
          </div>

          {/* History List */}
          <div className="space-y-6">
            {history.length === 0 ? (
              <Card className="card-dark text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  אין היסטוריה עדיין
                </h3>
                <p className="text-neutral-400">
                  ההודעות שתנתח יופיעו כאן
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
                    <Card className="card-dark">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Date and Status */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-start lg:justify-start lg:w-48 flex-shrink-0">
                          <div>
                            <div className="text-sm text-neutral-400 mb-1">
                              תאריך
                            </div>
                            <div className="text-white font-medium">
                              {new Date(item.date).toLocaleDateString('he-IL')}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {new Date(item.date).toLocaleTimeString('he-IL', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <div className={`p-2 rounded-full ${config.bgColor}`}>
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <span className={`font-medium ${config.color}`}>
                              {config.text}
                            </span>
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-neutral-400 mb-2">
                            תוכן ההודעה
                          </div>
                          <div className="text-white bg-neutral-700/50 p-4 rounded-lg border border-neutral-600 text-right">
                            {item.message}
                          </div>
                          
                          {/* Matched Words */}
                          {item.matchedWords && item.matchedWords.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-neutral-400 mb-2">
                                מילים חשודות שזוהו:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {item.matchedWords.map((word, wordIndex) => (
                                  <span
                                    key={wordIndex}
                                    className="px-2 py-1 bg-danger-600/20 text-danger-400 rounded text-sm"
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