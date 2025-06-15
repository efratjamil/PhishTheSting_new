import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Analyze() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (!message.trim()) {
      return navigate("/result", { state: { result: "empty" } });
    }

    const suspiciousWords = [
      "סיסמה",
      "לחץ כאן",
      "פרטי אשראי",
      "קישור",
      "אימות",
      "זיהוי",
    ];

    const isSuspicious = suspiciousWords.some((word) => message.includes(word));

    const result = isSuspicious ? "suspicious" : "safe";
    navigate("/result", { state: { result } });
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 5,
      }}
    >
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#1e293b",
              padding: 6,
              borderRadius: 4,
              boxShadow: "0px 4px 20px rgba(0, 255, 255, 0.2)",
              width: "100%",
              maxWidth: "550px",
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ mb: 3, fontWeight: "bold" }}
            >
              📩 הדבק את ההודעה שקיבלת
            </Typography>

            <TextField
              multiline
              rows={5}
              fullWidth
              placeholder="...הדבק כאן את ההודעה שלך"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                background: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
                mb: 3,
              }}
            />

            <Button
              onClick={handleAnalyze}
              fullWidth
              variant="contained"
              disabled={!message.trim()} // ✅ הכפתור חסום אם ההודעה ריקה
              sx={{
                background: "linear-gradient(90deg, #007bff 0%, #00e6e6 100%)",
                "&:hover": {
                  background: "#0056b3",
                },
                fontSize: "18px",
                py: 1,
                borderRadius: 2,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
                opacity: !message.trim() ? 0.6 : 1, // ✅ אפקט ויזואלי לכפתור חסום
                cursor: !message.trim() ? "not-allowed" : "pointer",
              }}
            >
              🔍 נתח הודעה
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
