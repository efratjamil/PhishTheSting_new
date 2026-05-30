import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  EyeIcon,
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const features = [
  {
    icon: EyeIcon,
    title: "ניתוח מקיף ומעמיק",
    description: "בדיקה רב-שכבתית של תוכן, קישורים, ודפוסי התנהגות חשודים",
  },
];

const stats = [
  { number: "99.8%", label: "דיוק בזיהוי", icon: CheckCircleIcon },
  { number: "2M+", label: "הודעות נותחו", icon: EyeIcon },
  { number: "24/7", label: "זמינות מלאה", icon: ClockIcon },
  { number: "100%", label: "בחינם לחלוטין", icon: StarIcon },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Trust Badges */}
              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                  <span>מאובטח SSL</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                  <span>מהימן על ידי אלפים</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                הגנה מקצועית נגד
                <span className="block text-blue-600">הונאות פישינג</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                שירות מקצועי ומהימן לזיהוי הונאות פישינג.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                as={Link}
                to="/login"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                התחבר בבטחה
                <ArrowRightIcon className="w-5 h-5 mr-2" />
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200"
              >
                הירשם בחינם
              </Button>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  האתר מאובטח בהצפנת SSL ולא שומר מידע אישי
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              נתונים שמוכיחים אמינות
            </h2>
            <p className="text-gray-600">
              מספרים אמיתיים המעידים על יעילות השירות
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-gray-50 rounded-lg"
                >
                  <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          ></motion.div>

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
                  <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-gray-200">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-blue-100 rounded-full">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-center">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          ></motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-xl border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Tips Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              עקרונות אבטחה בסיסיים
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              כללי זהב להגנה מפני הונאות פישינג
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "בדוק תמיד את כתובת השולח",
              "אל תלחץ על קישורים חשודים",
              "אמת מידע דרך ערוצים רשמיים",
              "השתמש באימות דו-שלבי",
              "עדכן תוכנות אבטחה באופן קבוע",
              "היזהר ממסרים דחופים ומאיימים",
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              התחל להגן על עצמך עוד היום
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              הצטרף לאלפי משתמשים שכבר מוגנים מפני הונאות פישינג
            </p>
            <Button
              as={Link}
              to="/register"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              התחל עכשיו - בחינם לחלוטין
            </Button>

            {/* Additional Trust Elements */}
            <div className="mt-8 flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>ללא התחייבות</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4" />
                <span>הרשמה מהירה</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-4 h-4" />
                <span>שירות מקצועי</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <img src="/iconew.png" alt="PhishTheSting" className="w-8 h-8" />
              <span className="text-xl font-bold">PhishTheSting</span>
            </div>
            <p className="text-gray-400 mb-4">
              שירות מקצועי להגנה מפני הונאות פישינג
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <span>© 2025 PhishTheSting</span>
              <span>•</span>
              <span>פרטיות מובטחת</span>
              <span>•</span>
              <span>אבטחה מתקדמת</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
