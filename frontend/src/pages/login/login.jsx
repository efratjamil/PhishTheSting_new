import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ ניווט לעמוד אזור אישי
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ✅ ניווט

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user)); // ✅ שמירת המשתמש
        navigate("/analyze"); // ✅ מעבר לאזור אישי
      } else {
        setError("האימייל או הסיסמה שגויים.");
      }
    } catch (err) {
      console.error("❌ שגיאה בהתחברות:", err);
      setError("האימייל או הסיסמה שגויים.");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
              maxWidth: "500px",
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ mb: 3, fontWeight: "bold" }}
            >
              🔑 התחבר
            </Typography>
            <TextField
              required
              fullWidth
              label="כתובת אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ background: "white", borderRadius: 2, mb: 2 }}
            />
            <TextField
              required
              fullWidth
              label="סיסמה"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ background: "white", borderRadius: 2, mb: 3 }}
            />
            {error && (
              <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>
            )}
            <Button
              onClick={handleLogin}
              fullWidth
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #007bff 0%, #00e6e6 100%)",
                "&:hover": { background: "#0056b3" },
                fontSize: "18px",
                py: 1,
                borderRadius: 2,
              }}
            >
              🚀 התחבר
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
