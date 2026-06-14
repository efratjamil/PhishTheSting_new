import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  LinkIcon,
  LightBulbIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import {
  clearAuthSession,
  getAuthHeaders,
  getStoredUser,
} from "../../utils/auth";
import { API_BASE_URL } from "../../config/apiConfig";

const tips = [
  "בדקו תמיד מי שלח את ההודעה והאם הכתובת נראית אמינה.",
  "אל תלחצו על קישורים מקוצרים או לא מוכרים לפני שמוודאים את היעד.",
  "חפשו ניסוח מלחיץ כמו חסימת חשבון, דחיפות או איום מיידי.",
  "אל תמסרו סיסמה, קוד אימות או פרטי אשראי דרך קישור שנשלח בהודעה.",
  "אם יש ספק, נכנסים לאתר הרשמי ידנית ולא דרך הקישור שבהודעה.",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    suspiciousScans: 0,
    safeScans: 0,
    totalCheckedLinks: 0,
  });

  useEffect(() => {
    const user = getStoredUser();

    if (!user?.id) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/analyze/dashboard`,
          {
            headers: getAuthHeaders(),
          },
        );

        setStats({
          totalScans: response.data?.stats?.totalScans || 0,
          suspiciousScans: response.data?.stats?.suspiciousScans || 0,
          safeScans: response.data?.stats?.safeScans || 0,
          totalCheckedLinks: response.data?.stats?.totalCheckedLinks || 0,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          clearAuthSession();
          navigate("/login");
          return;
        }

        setError(err.response?.data?.error || "שגיאה בטעינת הדשבורד");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const statCards = [
    {
      label: "הודעות שנבדקו",
      value: stats.totalScans,
      icon: DocumentTextIcon,
      tone: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "הודעות חשודות",
      value: stats.suspiciousScans,
      icon: ExclamationTriangleIcon,
      tone: "text-danger-600 bg-danger-50 border-danger-100",
    },
    {
      label: "הודעות תקינות",
      value: stats.safeScans,
      icon: ShieldCheckIcon,
      tone: "text-success-600 bg-success-50 border-success-100",
    },
    {
      label: "קישורים שנבדקו",
      value: stats.totalCheckedLinks,
      icon: LinkIcon,
      tone: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  const suspiciousRate =
    stats.totalScans > 0
      ? Math.round((stats.suspiciousScans / stats.totalScans) * 100)
      : 0;

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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
              <ChartBarIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              דשבורד אישי
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              תמונת מצב מהירה של ההודעות והקישורים שבדקת, יחד עם טיפים שיעזרו לזהות פישינג מהר יותר.
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                >
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">{card.label}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {card.value}
                        </p>
                      </div>
                      <div className={`rounded-full border p-3 ${card.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
            >
              <Card className="h-full">
                <div className="mb-5 flex items-center space-x-3 rtl:space-x-reverse">
                  <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    סיכום אבטחה אישי
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">אחוז הודעות חשודות</p>
                    <p className="mt-2 text-4xl font-bold text-gray-900">
                      {suspiciousRate}%
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      מתוך {stats.totalScans} בדיקות שביצעת במערכת
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                    <p className="text-sm font-semibold">פירוש מהיר</p>
                    <p className="mt-2 text-sm leading-6">
                      {stats.suspiciousScans > 0
                        ? `המערכת זיהתה ${stats.suspiciousScans} הודעות חשודות. כדאי לעבור על ההיסטוריה ולבדוק אילו דפוסים חוזרים על עצמם.`
                        : "עד כה לא זוהו הודעות חשודות בהיסטוריה שלך. עדיין חשוב לשמור על ערנות מול קישורים לא מוכרים."}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
            >
              <Card className="h-full">
                <div className="mb-5 flex items-center space-x-3 rtl:space-x-reverse">
                  <LightBulbIcon className="h-6 w-6 text-amber-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    טיפים לזיהוי פישינג
                  </h2>
                </div>

                <ul className="space-y-3">
                  {tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 rtl:space-x-reverse rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500"></span>
                      <span className="text-sm leading-6 text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
