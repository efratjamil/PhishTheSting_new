import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TipsSection from "../tips/TipsSection"; // ✅ ייבוא הטיפים
import ArticlesSection from "../tips/ArticlesSection"; // ✅ ייבוא הכתבות

export default function Home() {
  return (
    <Box sx={{ width: "100vw", textAlign: "center", color: "white" }}>
      {/* ✅ חלק עליון - דף הבית */}
      <Box
        sx={{
          height: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {/* ✅ אנימציית קבלת פנים */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography variant="h2" fontWeight="bold" sx={{ mb: 2 }}>
            ברוך הבא לאתר זיהוי הונאות פישינג
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            המקום שבו תוכל לבדוק אם הודעות שאתה מקבל הן הונאות.
          </Typography>
        </motion.div>

        {/* ✅ כפתורי התחברות והרשמה */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #007bff 0%, #00e6e6 100%)",
                "&:hover": { background: "#0056b3" },
                fontSize: "18px",
                px: 4,
                py: 1,
                boxShadow: "0px 4px 12px rgba(0, 123, 255, 0.5)",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              התחבר
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                fontSize: "18px",
                px: 4,
                py: 1,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              הירשם
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* ✅ אזור הטיפים עם אנימציה - נטען רק כשהוא נכנס למסך */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <Box sx={{ py: 10 }}>
          <TipsSection />
        </Box>
      </motion.div>

      {/* ✅ אזור הכתבות עם אנימציה - נטען רק כשהוא נכנס למסך */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <Box sx={{ py: 10 }}>
          <ArticlesSection />
        </Box>
      </motion.div>
    </Box>
  );
}
