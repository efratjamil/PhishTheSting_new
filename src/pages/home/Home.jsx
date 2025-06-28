import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "זיהוי מתקדם",
    description: "אלגוריתמים חכמים לזיהוי הונאות פישינג בזמן אמת"
  },
  {
    icon: EyeIcon,
    title: "ניתוח מקיף",
    description: "בדיקה מעמיקה של תוכן ההודעה וקישורים חשודים"
  },
  {
    icon: LightBulbIcon,
    title: "טיפים מקצועיים",
    description: "מדריכים ועצות למניעת נפילה בהונאות עתידיות"
  }
];

const stats = [
  { number: "99.9%", label: "דיוק בזיהוי" },
  { number: "50K+", label: "הודעות נותחו" },
  { number: "24/7", label: "זמינות" },
  { number: "0", label: "עלות" }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-6 leading-tight">
                הגנה חכמה נגד
                <span className="block gradient-text">הונאות פישינג</span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                המקום הבטוח והמהיר ביותר לבדוק אם ההודעות שאתה מקבל הן הונאות. 
                טכנולוגיה מתקדמת לזיהוי איומים בזמן אמת.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/login">
                <Button
                  size="lg"
                  className="group shadow-glow"
                >
                  התחבר עכשיו
                  <ArrowRightIcon className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-neutral-900"
                >
                  הירשם בחינם
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/20 rounded-full blur-xl animate-bounce-subtle"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary-500/20 rounded-full blur-xl animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-400 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6">
              למה לבחור בנו?
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              טכנולוגיה מתקדמת ופשוטה לשימוש, המספקת הגנה מקסימלית מפני איומי פישינג
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card className="card-dark text-center h-full group hover:shadow-glow">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-primary-600/20 rounded-full group-hover:bg-primary-600/30 transition-colors duration-300">
                        <Icon className="w-8 h-8 text-primary-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Tips Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/20 to-secondary-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6">
              טיפי אבטחה חיוניים
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              עקרונות בסיסיים שיעזרו לך להישאר מוגן מפני הונאות פישינג
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "בדוק תמיד את כתובת השולח",
              "אל תלחץ על קישורים חשודים",
              "אמת מידע דרך ערוצים רשמיים",
              "השתמש באימות דו-שלבי",
              "עדכן תוכנות אבטחה",
              "היזהר ממסרים דחופים"
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10"
              >
                <CheckCircleIcon className="w-6 h-6 text-success-400 flex-shrink-0" />
                <span className="text-white">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-6">
              מוכן להתחיל?
            </h2>
            <p className="text-xl text-neutral-300 mb-8">
              הצטרף לאלפי משתמשים שכבר מוגנים מפני הונאות פישינג
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="shadow-glow-secondary"
              >
                התחל עכשיו - בחינם
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}