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
  const { textAnalysis, urlAnalysis, matchedWords } = location.state || {};

  const isSuspicious = Boolean(textAnalysis || urlAnalysis);
  const riskLevel = isSuspicious ? 'high' : 'low';

  const riskConfig = {
    high: {
      icon: ExclamationTriangleIcon,
      title: 'ייתכן שמדובר בהודעת פישינג',
      description: 'זוהו סימנים חשודים בתוכן/בקישורים. הימנע/י מלחיצה או מסירת פרטים לפני אימות עם הגורם השולח.',
    },
    low: {
      icon: ShieldCheckIcon,
      title: 'לא זוהו סימנים חשודים',
      description: 'לא נמצאו התאמות למילות אזהרה. עדיין מומלץ לשמור על ערנות ולהימנע מלחיצה על קישורים לא מוכרים.',
    }
  };

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const recommendations = isSuspicious ? [
    'אל תמסור פרטים אישיים או סיסמאות',
    'אל תלחץ על קישורים או קבצים לא מזוהים',
    'בדוק את כתובת השולח והאם יש שגיאות כתיב',
    'דווח על ההודעה כמחשידה לאבטחת מידע/מנהל',
    'אם אינך בטוח/ה – מחק את ההודעה'
  ] : [
    'ההודעה נראית תקינה',
    'המשך לנהוג בזהירות בלחיצה על קישורים וקבצים',
    'בדוק תמיד את מקור ההודעה וזהות השולח/ת',
    'שמור/י על מודעות לאיומי פישינג גם בהודעות עתידיות'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
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
              className={`w-20 h-20 mx-auto mb-6 rounded-full border flex items-center justify-center ${
                isSuspicious ? 'bg-danger-50 border-danger-200' : 'bg-success-50 border-success-200'
              }`}
            >
              <Icon className={`w-10 h-10 ${isSuspicious ? 'text-danger-600' : 'text-success-600'}`} />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">
              תוצאות הבדיקה
            </h1>
          </div>

          {/* Main Result */}
          <div className="mb-8">
            <Alert type={isSuspicious ? 'error' : 'success'} title={config.title}>
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
              <Card className="h-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-3 rtl:space-x-reverse">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  <span>פרטי הניתוח</span>
                </h2>

                <div className="space-y-6">
                  {/* Text Analysis */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">תוכן ההודעה</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        textAnalysis
                          ? 'bg-danger-50 text-danger-600 border-danger-200'
                          : 'bg-success-50 text-success-600 border-success-200'
                      }`}>
                        {textAnalysis ? 'חשוד' : 'תקין'}
                      </span>
                    </div>
                    {matchedWords && matchedWords.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">מילות אזהרה שזוהו:</p>
                        <div className="flex flex-wrap gap-2">
                          {matchedWords.map((word, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-danger-50 text-danger-700 border border-danger-200 rounded text-sm"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL Analysis */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">קישורים</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        urlAnalysis
                          ? 'bg-danger-50 text-danger-600 border-danger-200'
                          : 'bg-success-50 text-success-600 border-success-200'
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
              <Card className="h-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-3 rtl:space-x-reverse">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  <span>המלצות</span>
                </h2>

                <ul className="space-y-3 text-right">
                  {recommendations.map((recommendation, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      className="flex items-start space-x-3 rtl:space-x-reverse"
                    >
                      <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isSuspicious ? 'bg-danger-600' : 'bg-success-600'}`}></span>
                      <span className="text-gray-700">{recommendation}</span>
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
            <Button onClick={() => navigate('/analyze')} size="lg" className="shadow-glow">
              <ArrowPathIcon className="w-5 h-5 ml-2" />
              ניתוח חדש – נסה/י שוב
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

