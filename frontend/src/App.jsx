import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Analyze from "./pages/analyze/Analyze";
import History from "./pages/history/history";
import Profile from "./pages/profile/Profile";
import Result from "./pages/result/Result";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {" "}
        <Navbar />
        <div className="h-16" />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
