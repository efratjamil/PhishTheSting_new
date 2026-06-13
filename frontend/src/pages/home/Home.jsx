import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CustomButton from "../../components/ui/CustomButton";

const tips = [
  {
    icon: "🔍",
    title: "בדקו את כתובת השולח",
    description:
      "ודאו שהכתובת תואמת לארגון הרשמי ואינה מכילה שינויים חשודים.",
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
      "הודעות שמפעילות לחץ לפעולה מיידית הן סימן אזהרה נפוץ.",
  },
  {
    icon: "📝",
    title: "בדקו שגיאות כתיב וניסוח",
    description:
      "שפה לא מקצועית או טעויות חריגות עשויות להעיד על ניסיון התחזות.",
  },
  {
    icon: "📢",
    title: "אמתו בקשות בערוץ רשמי",
    description:
      "במקרה של ספק, פנו ישירות לארגון דרך האתר או מספר הטלפון הרשמי.",
  },
];

const infoCards = [
  {
    id: "system",
    eyebrow: "מידע למשתמש",
    title: "מידע על המערכת",
    triggerLabel: "לקריאה על המערכת",
    accent: "from-[#449ba2]/15 via-white to-[#7dd3cf]/10",
    border: "border-[#449ba2]/20",
    paragraphs: [
      "מערכת PhishTheSting עוזרת לזהות הודעות וקישורים שעלולים להיות ניסיונות פישינג.",
      "פישינג הוא ניסיון הונאה שבו שולחים הודעה שנראית אמינה, במטרה לגרום למשתמש ללחוץ על קישור, למסור פרטים אישיים או לבצע פעולה מסוימת.",
      "המערכת מאפשרת להדביק הודעה חשודה ולקבל בדיקה פשוטה וברורה: האם ההודעה נראית תקינה או חשודה, ומה הסיבות לכך.",
    ],
    stepsTitle: "איך משתמשים במערכת?",
    steps: [
      "מדביקים את ההודעה שקיבלתם.",
      "לוחצים על כפתור הבדיקה.",
      "מקבלים תוצאה עם הסבר קצר וברור.",
    ],
    closing:
      "המערכת בודקת את תוכן ההודעה ואת הקישורים שמופיעים בה, ומציגה סימנים שעלולים להעיד על פישינג, כמו ניסוח מלחיץ, בקשה לפרטים אישיים או קישור חשוד.",
    noteTitle: "חשוב לדעת:",
    note:
      "המערכת נועדה לעזור בקבלת החלטה בטוחה יותר, אך היא אינה מחליפה שיקול דעת אישי. אם הודעה נראית חשודה, מומלץ לא ללחוץ על קישורים ולא למסור פרטים אישיים לפני שבודקים מול הגורם הרשמי.",
  },
  {
    id: "privacy",
    eyebrow: "שמירה על פרטיות",
    title: "מדיניות פרטיות",
    triggerLabel: "לקריאה על הפרטיות",
    accent: "from-slate-900 via-slate-950 to-[#12353a]",
    border: "border-slate-800/80",
    dark: true,
    paragraphs: [
      "המערכת שומרת רק את המידע הדרוש להפעלתה, כמו פרטי המשתמש והיסטוריית הבדיקות שלו.",
      "הסיסמה נשמרת בצורה מוצפנת ואינה נשמרת כטקסט גלוי.",
      "היסטוריית הבדיקות נשמרת כדי לאפשר למשתמש לחזור לבדיקות קודמות שביצע ולראות את התוצאות שלהן.",
      "המידע שנשמר במערכת משמש לצורך הפעלת השירות בלבד, ואינו מיועד להעברה לגורמים אחרים שלא לצורך פעולת המערכת.",
      "במהלך בדיקת קישורים, ייתכן שהמערכת תשתמש בשירותי בדיקה חיצוניים כדי לבדוק אם הקישור מסוכן. שימוש זה נועד לצורך ביצוע הבדיקה בלבד.",
    ],
    noteTitle: "חשוב לזכור:",
    note:
      "המערכת מספקת הערכת סיכון, אך אינה מבטיחה זיהוי מלא של כל הודעת פישינג. לכן תמיד מומלץ לנהוג בזהירות ולא למסור פרטים אישיים דרך קישורים חשודים.",
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
  const [activeInfoCard, setActiveInfoCard] = useState(null);
  const activeModalCard =
    infoCards.find((card) => card.id === activeInfoCard) || null;

  return (
    <div className="min-h-screen overflow-hidden bg-white font-sans">
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
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="inline-block bg-[linear-gradient(120deg,#0f172a_0%,#449ba2_35%,#7dd3cf_50%,#449ba2_65%,#0f172a_100%)] bg-[length:220%_220%] bg-clip-text pb-2 text-transparent"
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
            <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
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
              {tips.map((tip) => (
                <motion.div
                  key={tip.title}
                  variants={item}
                  className="group rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(68,155,162,0.14)]"
                  whileHover={{ y: -6, scale: 1.01 }}
                >
                  <div className="flex h-full flex-col gap-4 text-right" dir="rtl">
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

      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f3fbfb_100%)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-3xl text-center"
          >
            <span className="inline-flex rounded-full border border-[#449ba2]/20 bg-[#449ba2]/10 px-4 py-1 text-sm font-semibold text-[#1d6f76]">
              מידע נוסף
            </span>
            <h2 className="mt-5 text-4xl font-bold text-slate-900 sm:text-5xl">
              לפני שמתחילים, כדאי להכיר
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 sm:text-xl">
              הסבר קצר על מטרת המערכת ועל הדרך שבה נשמר המידע שלכם בזמן השימוש.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {infoCards.map((card, index) => (
              <motion.article
                key={card.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: index * 0.08 }}
                viewport={{ once: true }}
                dir="rtl"
                className={`rounded-[2rem] border ${card.border} bg-gradient-to-br ${card.accent} p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8`}
              >
                <div className="flex h-full flex-col text-right">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          card.dark ? "text-[#7dd3cf]" : "text-[#1d6f76]"
                        }`}
                      >
                        {card.eyebrow}
                      </p>
                      <h3
                        className={`mt-2 text-2xl font-bold sm:text-3xl ${
                          card.dark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                        card.dark
                          ? "bg-white/10 text-white"
                          : "bg-white text-[#1d6f76] shadow-[0_10px_24px_rgba(68,155,162,0.14)]"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <p
                    className={`text-base leading-8 ${
                      card.dark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    {card.paragraphs[0]}
                  </p>

                  <button
                    type="button"
                    onClick={() => setActiveInfoCard(card.id)}
                    className={`mt-6 inline-flex w-fit items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 ${
                      card.dark
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {card.triggerLabel}
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeModalCard ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
            onClick={() => setActiveInfoCard(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              dir="rtl"
              onClick={(event) => event.stopPropagation()}
              className={`relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border ${activeModalCard.border} ${
                activeModalCard.dark
                  ? `bg-gradient-to-br ${activeModalCard.accent}`
                  : "bg-white"
              } shadow-[0_30px_90px_rgba(15,23,42,0.28)]`}
            >
              <div className="max-h-[88vh] overflow-y-auto p-6 sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveInfoCard(null)}
                    className={`order-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeModalCard.dark
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    סגירה
                  </button>

                  <div className="order-2 flex-1 text-center">
                    <p
                      className={`text-sm font-semibold ${
                        activeModalCard.dark
                          ? "text-[#7dd3cf]"
                          : "text-[#1d6f76]"
                      }`}
                    >
                      {activeModalCard.eyebrow}
                    </p>
                    <h3
                      className={`mt-2 text-2xl font-bold sm:text-3xl ${
                        activeModalCard.dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {activeModalCard.title}
                    </h3>
                  </div>
                </div>

                <div
                  className={`space-y-4 text-right text-base leading-8 ${
                    activeModalCard.dark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  {activeModalCard.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {activeModalCard.steps?.length ? (
                  <div className="mt-6 rounded-[1.5rem] border border-white/60 bg-white/75 p-5 text-slate-800 shadow-[0_8px_24px_rgba(255,255,255,0.45)]">
                    <h4 className="text-lg font-bold text-slate-900">
                      {activeModalCard.stepsTitle}
                    </h4>
                    <ol className="mt-4 space-y-3">
                      {activeModalCard.steps.map((step, stepIndex) => (
                        <li key={step} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#449ba2] text-sm font-bold text-white">
                            {stepIndex + 1}
                          </span>
                          <span className="leading-7">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {activeModalCard.closing ? (
                  <p
                    className={`mt-6 text-base leading-8 ${
                      activeModalCard.dark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    {activeModalCard.closing}
                  </p>
                ) : null}

                <div
                  className={`mt-6 rounded-[1.5rem] border p-5 ${
                    activeModalCard.dark
                      ? "border-white/10 bg-white/5 text-slate-100"
                      : "border-slate-200 bg-white/80 text-slate-700"
                  }`}
                >
                  <p
                    className={`text-base font-bold ${
                      activeModalCard.dark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {activeModalCard.noteTitle}
                  </p>
                  <p className="mt-3 text-base leading-8">
                    {activeModalCard.note}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <footer className="border-t border-slate-200/80 bg-white/80 px-4 py-12 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-slate-200/70 bg-slate-950 px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:px-10">
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <img
                  src="/iconew.png"
                  alt="PhishTheSting"
                  className="h-10 w-10"
                />
                <span className="text-2xl font-black tracking-wide">
                  PhishTheSting
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
                <span>© 2025 PhishTheSting</span>
                <span>•</span>
                <span>ביטחון לפני הכל</span>
                <span>•</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
