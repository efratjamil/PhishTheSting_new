import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { textAnalysis, urlAnalysis, matchedWords, originalMessage } = location.state || {};

  const isSuspicious = textAnalysis || urlAnalysis;
  const riskLevel = isSuspicious ? 'high' : 'low';

  const riskConfig = {
    high: {
      color: 'danger',
      icon: ExclamationTriangleIcon,
      title: 'הודעה חשודה זוהתה!',
      description: 'ההודעה מכילה סימנים המעידים על הונאת פישינג',
      bgColor: 'bg-danger-50',
      borderColor: 'border-danger-200',
      textColor: 'text-danger-800'
    },
    low: {
      color: 'success',
      icon: ShieldCheckIcon,
      title: 'ההודעה נראית בטוחה',
      description: 'לא זוהו סימנים מחשידים בהודעה',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      textColor: 'text-success-800'
    }
  };

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const recommendations = isSuspicious ? [
    "אל תלחץ על קישורים בהודעה",
    "אל תמסור מידע אישי או פיננסי",
    "אמת את המידע דרך ערוצים רשמיים",
    "דווח על ההודעה לרשויות המתאימות",
    "מחק את ההודעה"
  ] : [
    "ההודעה נראית לגיטימית",
    "עדיין היזהר ממסירת מידע רגיש",
    "בדוק את כתובת השולח",
    "במקרה של ספק - אמת דרך ערוצים רשמיים"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isSuspicious ? 'bg-danger-600/20' : 'bg-success-600/20'
              }`}
            >
              <Icon className={`w-10 h-10 ${
                isSuspicious ? 'text-danger-400' : 'text-success-400'
              }`} />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              תוצאות הניתוח
            </h1>
          </div>

          {/* Main Result */}
          <div className="mb-8">
            <Alert 
              type={isSuspicious ? 'error' : 'success'}
              title={config.title}
            >
              {config.description}
            </Alert>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Analysis Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Card className="card-dark h-full">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3 rtl:space-x-reverse">
                  <DocumentTextIcon className="w-6 h-6 text-primary-400" />
                  <span>פירוט הניתוח</span>
                </h2>

                <div className="space-y-6">
                  {/* Text Analysis */}
                  <div className="p-4 bg-neutral-700/50 rounded-lg border border-neutral-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-white">ניתוח תוכן ההודעה</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        textAnalysis 
                          ? 'bg-danger-600/20 text-danger-400' 
                          : 'bg-success-600/20 text-success-400'
                      }`}>
                        {textAnalysis ? 'חשוד' : 'תקין'}
                      </span>
                    </div>
                    {matchedWords && matchedWords.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-neutral-400 mb-2">מילים חשודות שזוהו:</p>
                        <div className="flex flex-wrap gap-2">
                          {matchedWords.map((word, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-danger-600/20 text-danger-400 rounded text-sm"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL Analysis */}
                  <div className="p-4 bg-neutral-700/50 rounded-lg border border-neutral-600">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">ניתוח קישורים</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        urlAnalysis 
                          ? 'bg-danger-600/20 text-danger-400' 
                          : 'bg-success-600/20 text-success-400'
                      }`}>
                        {urlAnalysis ? 'חשוד' : 'תקין'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Card className="card-dark h-full">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3 rtl:space-x-reverse">
                  <ShieldCheckIcon className="w-6 h-6 text-primary-400" />
                  <span>המלצות לפעולה</span>
                </h2>

                <ul className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      className="flex items-start space-x-3 rtl:space-x-reverse"
                    >
                      <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        isSuspicious ? 'bg-danger-400' : 'bg-success-400'
                      }`}></span>
                      <span className="text-neutral-300">{recommendation}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={() => navigate("/analyze")}
              size="lg"
              className="shadow-glow"
            >
              <ArrowPathIcon className="w-5 h-5 ml-2" />
              נתח הודעה נוספת
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}