const suspiciousWords = [
  "סיסמה",
  "אימות",
  "התחברות",
  "התחבר",
  "כניסה",
  "זיהוי",
  "בהול",
  "נחסם",
  "לחץ",
  "לחץ כאן",
  "אשר",
  "שלם",
  "עדכן",
  "קישור",
  "קבל",
  "שלח",
  "מבצע",
  "זכית",
  "חינם",
  "החזר",
  "אזהרה",
  "סכנה",
  "תמיכה טכנית",
];

function analyzeTextContent(text = "") {
  const matchedWords = suspiciousWords.filter((word) => text.includes(word));

  return {
    isSuspicious: matchedWords.length > 0,
    matchedWords,
  };
}

module.exports = analyzeTextContent;
