import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/login", formData);
      
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/analyze");
      }
    } catch (err) {
      setError(err.response?.data?.message || "שגיאה בהתחברות. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100"
              >
                <img src="/iconew.png" alt="Logo" className="w-10 h-10" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ברוך הבא בחזרה
              </h1>
              <p className="text-gray-600">
                התחבר לחשבון שלך כדי להמשיך
              </p>
            </div>

            {/* Security Notice */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2 text-green-800 text-sm">
                <LockClosedIcon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">החיבור מאובטח בהצפנת SSL</span>
              </div>
            </div>

            {error && (
              <div className="mb-6">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="כתובת אימייל"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                placeholder="your@email.com"
              />

              <div className="relative">
                <Input
                  label="סיסמה"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 pr-12 bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
                loading={loading}
                disabled={!formData.email || !formData.password}
              >
                {loading ? "מתחבר..." : "התחבר בבטחה"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                אין לך חשבון?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  הירשם כאן
                </Link>
              </p>
            </div>

            {/* Trust Elements */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <ShieldCheckIcon className="w-3 h-3" />
                  <span>מאובטח</span>
                </div>
                <span>•</span>
                <span>פרטיות מובטחת</span>
                <span>•</span>
                <span>ללא שמירת מידע</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}