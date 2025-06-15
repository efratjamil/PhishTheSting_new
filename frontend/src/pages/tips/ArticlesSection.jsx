import React from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

const articles = [
  {
    title: "🛑 משרד התקשורת מזהיר: מתקפות פישינג מתוחכמות נגד אזרחים",
    description:
      "בשבועות האחרונים דווח על עלייה בניסיונות הונאה בהם מתחזים נוכלים לנציגי חברות טכנולוגיה ובנקים.",
    link: "https://www.gov.il/he/pages/news-22082023",
  },
  {
    title: "📩 הונאת פישינג דרך הודעות טקסט – איך להיזהר?",
    description:
      "כדי להונות אזרחים ולגרום להשיג מידע אישי. כך תוכלו לזהות הודעות ההונאה לפני שתפלו קורבן.",
    link: "https://www.ice.co.il/tv/news/article/1040453",
  },
  {
    title: "🔐 הניסיון הכי מתוחכם עד כה? מתקפת פישינג חדשה בישראל",
    description:
      "האקרים משתמשים בטכניקות מתקדמות כדי לגרום לאנשים למסור מידע אישי ורגיש.",
    link: "https://www.israelhayom.co.il/tech/tech-news/article/17192959",
  },
  {
    title: "🏦 התרמית שמסכנת את חשבון הבנק שלכם",
    description:
      "שיטה חדשה של עברייני רשת כוללת הודעות בנקאיות מזויפות עם קישורים מסוכנים.",
    link: "https://www.mako.co.il/nexter-news/Article-85bd0d5aa4d0191027.htm",
  },
];

export default function ArticlesSection() {
  return (
    <Box
      sx={{
        backgroundColor: "#0f172a",
        py: 6,
        textAlign: "center",
        color: "white",
      }}
    >
      <Container>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
          חדשות ועדכונים על הונאות פישינג
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {articles.map((article, index) => (
            <Grid item xs={12} sm={6} md={5} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    backgroundColor: "#1e293b",
                    color: "white",
                    boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
                    padding: 2,
                    height: "170px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: "10px",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
                    margin: "10px", // ✅ מוסיף רווח חיצוני בין הכרטיסים
                  }}
                >
                  <CardContent sx={{ p: 1, textAlign: "right" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "15px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {article.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        fontSize: "13px",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textAlign: "right",
                      }}
                    >
                      {article.description}
                    </Typography>
                  </CardContent>
                  <Button
                    variant="contained"
                    size="small"
                    href={article.link}
                    target="_blank"
                    sx={{
                      backgroundColor: "#00e6e6",
                      color: "#0f172a",
                      fontWeight: "bold",
                      fontSize: "12px",
                      "&:hover": { backgroundColor: "#00b3b3" },
                    }}
                  >
                    קרא עוד
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
