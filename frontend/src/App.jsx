import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Navbar from "./components/navbar";
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import Analyze from "./pages/analyze/analyze";
import History from "./pages/history/history"; // ✅ הוספת מסך היסטוריה
import Profile from "./components/profile";
import Result from "./pages/result/result";

const theme = createTheme(); // יצירת נושא ברירת מחדל עבור MUI

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar /> {/* סרגל הניווט יוצג בכל הדפים */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
