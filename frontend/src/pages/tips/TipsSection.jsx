import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";
import SecurityIcon from "@mui/icons-material/Security";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import PhishingIcon from "@mui/icons-material/Phishing";

const tips = [
  {
    title: "📩 בדוק את כתובת השולח",
    description: "אם המייל הגיע מכתובת לא מוכרת או חשודה – אל תלחץ על קישורים.",
    icon: <ReportGmailerrorredIcon fontSize="large" />,
  },
  {
    title: "🔒 אל תמסור פרטים אישיים",
    description:
      "בנק או חברה אמינה לעולם לא תבקש סיסמה או מספר כרטיס אשראי במייל.",
    icon: <SecurityIcon fontSize="large" />,
  },
  {
    title: "🔗 בדוק קישורים לפני שאתה לוחץ",
    description:
      "רחף עם העכבר מעל הקישור כדי לראות אם הכתובת אמינה ולא מזויפת.",
    icon: <PhishingIcon fontSize="large" />,
  },
];

export default function TipsSection() {
  return (
    <Box
      sx={{
        width: "100vw",
        textAlign: "center",
        color: "white",
        py: 6,
        backgroundColor: "#0f172a",
      }}
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>
            איך לזהות הונאת פישינג?
          </Typography>
        </motion.div>
        <Grid container spacing={4}>
          {tips.map((tip, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.3 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    backgroundColor: "#1e293b",
                    color: "white",
                    boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
                    textAlign: "center",
                    padding: 3,
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    {tip.icon}
                  </Box>
                  <CardContent>
                    <Typography variant="h6">{tip.title}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {tip.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
