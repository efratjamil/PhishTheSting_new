import React, { useState } from "react";
import axios from "axios";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Alert,
  Grid,
  Box,
  Typography,
  Container,
  Link,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  isEmptyField,
  isValidEmail,
  isStrongPassword,
} from "../../utils/validation";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const { firstName, lastName, email, password } = form;

    if (isEmptyField(firstName, lastName, email, password)) {
      return setError("נא למלא את כל השדות.");
    }

    if (!isValidEmail(email)) {
      return setError("כתובת האימייל לא תקינה.");
    }

    if (!isStrongPassword(password)) {
      return setError("הסיסמה צריכה להכיל לפחות 6 תווים.");
    }

    try {
      const res = await axios.post("http://localhost:5000/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "אירעה שגיאה, נסה שוב מאוחר יותר."
      );
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
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
              boxShadow: "0 4px 15px rgba(255,255,255,0.1)",
              color: "white",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "#007bff" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              הרשמה למערכת
            </Typography>

            {success && (
              <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
                נרשמת בהצלחה! מועבר לדף התחברות...
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: 1, width: "100%" }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="firstName"
                    label="שם פרטי"
                    fullWidth
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    sx={{ background: "white", borderRadius: 1 }}
                    inputProps={{ style: { textAlign: "right" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="lastName"
                    label="שם משפחה"
                    fullWidth
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    sx={{ background: "white", borderRadius: 1 }}
                    inputProps={{ style: { textAlign: "right" } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="email"
                    label="אימייל"
                    type="text"
                    fullWidth
                    required
                    value={form.email}
                    onChange={handleChange}
                    sx={{ background: "white", borderRadius: 1 }}
                    inputProps={{ style: { textAlign: "right" } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="password"
                    label="סיסמה"
                    type="password"
                    fullWidth
                    required
                    value={form.password}
                    onChange={handleChange}
                    sx={{ background: "white", borderRadius: 1 }}
                    inputProps={{ style: { textAlign: "right" } }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  background: "linear-gradient(90deg, #007bff, #00e6e6)",
                  fontSize: "18px",
                  py: 1,
                  borderRadius: 2,
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    background: "#0056b3",
                  },
                }}
              >
                הירשם
              </Button>

              <Grid container justifyContent="center">
                <Grid item>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    sx={{ color: "#00e6e6" }}
                  >
                    כבר יש לך חשבון? התחבר
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
