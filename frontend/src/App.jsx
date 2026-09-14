import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home/Home";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Analyze from "./pages/analyze/Analyze";
import Dashboard from "./pages/dashboard/Dashboard";
import History from "./pages/history/history";
import Profile from "./pages/profile/Profile";
import ResetPassword from "./pages/reset-password/ResetPassword";
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/analyze"
              element={
                <ProtectedRoute>
                  <Analyze />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result"
              element={
                <ProtectedRoute>
                  <Result />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
