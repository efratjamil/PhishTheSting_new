import React from "react";
import { motion } from "framer-motion";
import CustomButton from "../../components/ui/CustomButton";

const tips = [
  {
    icon: "🔍",
    title: "בדקו את כתובת השולח",
    description:
      "ודאו שהדומיין תואם לארגון הרשמי ואינו מכיל שינויים חשודים.",
  },
  {
    icon: "🔗",
    title: "בדקו קישורים לפני לחיצה",
    description:
      "העבירו את העכבר מעל הקישור ובחנו את כתובת היעד המלאה.",
  },
  {
    icon: "⚠️",
    title: "חשדו בבקשות למידע אישי",
    description:
      "בנקים, חברות אשראי וגופים רשמיים אינם מבקשים סיסמאות או קודי אימות במייל.",
  },
  {
    icon: "🚨",
    title: "היזהרו מתחושת דחיפות",
    description:
      "הודעות המפעילות לחץ לפעולה מיידית הן סימן אזהרה נפוץ.",
  },
  {
    icon: "✍️",
    title: "בדקו שגיאות כתיב וניסוח",
    description:
      "שפה לא מקצועית או טעויות חריגות עשויות להעיד על ניסיון התחזות.",
  },
  {
    icon: "🏢",
    title: "אמתו בקשות בערוץ רשמי",
    description:
      "במקרה של ספק, פנו ישירות לארגון דרך האתר או מספר הטלפון הרשמי.",
  },
];

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      <section className="relative isolate overflow-visible bg-[linear-gradient(180deg,#eef8f8_0%,#f8fcfc_52%,#ffffff_100%)] px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_18%,rgba(68,155,162,0.22),transparent_24%),radial-gradient(circle_at_15%_35%,rgba(255,255,255,0.92),transparent_28%),radial-gradient(circle_at_85%_35%,rgba(255,255,255,0.9),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,#ffffff_100%)]" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="mx-auto max-w-5xl pb-3 text-5xl font-black leading-[1.08] tracking-[-0.05em] text-slate-900 sm:text-6xl lg:text-8xl"
            >
              <motion.span
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="inline-block pb-2 bg-[linear-gradient(120deg,#0f172a_0%,#449ba2_35%,#7dd3cf_50%,#449ba2_65%,#0f172a_100%)] bg-[length:220%_220%] bg-clip-text text-transparent"
              >
                PhishTheSting
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.75 }}
              className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-slate-600 sm:text-2xl"
            >
              מערכת לזיהוי וניתוח הודעות פישינג
            </motion.p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CustomButton to="/login">להתחיל לבדוק</CustomButton>
              <CustomButton to="/register">פתיחת חשבון</CustomButton>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl font-black text-slate-900 sm:text-5xl">
              כיצד לזהות הודעת פישינג?
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              whileHover="hover"
              transition={{ staggerChildren: 0.12, delayChildren: 0.08 }}
              viewport={{ once: true }}
              className="contents"
            >
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="group rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(68,155,162,0.14)]"
                  whileHover={{ y: -6, scale: 1.01 }}
                >
                  <div className="flex h-full flex-col gap-4 text-right">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#449ba2]/10 text-2xl transition duration-300 group-hover:bg-[#449ba2]/15"
                        whileHover={{ rotate: -6, scale: 1.08 }}
                      >
                        <span aria-hidden="true">{tip.icon}</span>
                      </motion.div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {tip.title}
                      </h3>
                    </div>
                    <p className="text-base leading-7 text-slate-600">
                      {tip.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/80 px-4 py-12 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-slate-200/70 bg-slate-950 px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:px-10">
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <img src="/iconew.png" alt="PhishTheSting" className="h-10 w-10" />
                <span className="text-2xl font-black tracking-wide">
                  PhishTheSting
                </span>
              </div>
              <p className="mx-auto mb-6 max-w-2xl text-slate-300">
                בודקים הודעות, מסמנים סיכון, ועוזרים לזהות פישינג לפני שהוא
                מזהה אותך.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
                <span>© 2025 PhishTheSting</span>
                <span>•</span>
                <span>פרטיות לפני הכול</span>
                <span>•</span>
                <span>אבטחה בלי רעש</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
