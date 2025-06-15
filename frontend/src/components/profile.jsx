import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      setError("אנא מלא את כל השדות");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/update-password",
        {
          email: user.email,
          newPassword,
        }
      );

      setSuccess(response.data.message);
      setError(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("❌ שגיאה בעת עדכון הסיסמה");
      console.error("Error updating password:", err);
    }
  };

  if (loading) {
    return <Typography sx={{ color: "white" }}>טוען...</Typography>;
  }

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh", // ✅ במקום height קבוע
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingY: 6, // ✅ רווח מלמעלה ולמטה
      }}
    >
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#1e293b",
            padding: 4,
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 4,
            boxShadow: "0px 4px 20px rgba(0, 255, 255, 0.2)",
            width: "100%",
            maxWidth: "500px",
            color: "white",
            textAlign: "center",

            mb: -5,
            mt: 5,
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ mb: 3, fontWeight: "bold" }}
          >
            👤 אזור אישי
          </Typography>
          {user ? (
            <>
              <Typography sx={{ mb: 1 }}>שם פרטי: {user.firstName}</Typography>
              <Typography sx={{ mb: 1 }}>שם משפחה: {user.lastName}</Typography>
              <Typography sx={{ mb: 3 }}>📧 אימייל: {user.email}</Typography>
            </>
          ) : (
            <Typography sx={{ color: "red" }}>⚠️ לא נמצא משתמש</Typography>
          )}
          {/* 🔐 שינוי סיסמה */}
          <Typography
            component="h2"
            variant="h6"
            sx={{ mt: 3, mb: 2, fontWeight: "bold" }}
          >
            🔒 שינוי סיסמה
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="סיסמה חדשה"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{
              background: "white",
              borderRadius: 2,
              mb: 2,
            }}
          />
          <TextField
            fullWidth
            type="password"
            label="אימות סיסמה"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{
              background: "white",
              borderRadius: 2,
              mb: 3,
            }}
          />
          {error && (
            <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>
          )}
          {success && (
            <Typography sx={{ color: "lightgreen", mb: 2 }}>
              {success}
            </Typography>
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={handlePasswordUpdate}
            sx={{
              background: "linear-gradient(90deg, #007bff 0%, #00e6e6 100%)",
              "&:hover": { background: "#0056b3" },
              fontSize: "18px",
              py: 1,
              borderRadius: 2,
            }}
          >
            🔄 עדכן סיסמה
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
