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
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import CustomButton from "../../components/ui/CustomButton";

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
      <section className="relative pt-24 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                הגנה מקצועית נגד
                <span className="block mt-2 text-[#449ba2]">הונאות פישינג</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                שירות מקצועי ומהימן לזיהוי הונאות פישינג. פותח על ידי מומחי
                אבטחת מידע ומבוסס על מחקר אקדמי מתקדם.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <CustomButton to="/login">כניסה</CustomButton>
              <CustomButton to="/register">הרשמה</CustomButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}

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
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
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
                className="flex items-center space-x-3 rtl:space-x-reverse p-6 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{tip}</span>
              </motion.div>
            ))}
          </div>
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
