import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/login",
        formData
      );
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/analyze");
      }
    } catch (err) {
      setError(err.response?.data?.message || "שגיאה בהתחברות. נסו שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Keep the card fully within the viewport below the fixed navbar (h-16 = 64px)
    <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4 pt-8 md:pt-12 pb-8">
      {/* קונטיינר צר ונקי */}
      <div dir="rtl" className="w-full max-w-sm">
        {" "}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/70 p-4 -mt-8"
        >
          {/* לוגו + כותרת */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e9f4f5] ring-1 ring-[#449ba2]/20 flex items-center justify-center"
            >
              <img
                src="/iconew.png"
                alt="PhishTheSting"
                className="w-10 h-10"
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">התחברות</h1>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {/* טופס */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* אימייל */}
            <Input
              label="כתובת אימייל"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              // אימייל ל-LTR כדי שהטקסט ייושר נכון בשדה
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#449ba2] focus:border-[#449ba2]
                         transition-colors duration-200"
              inputProps={{ dir: "ltr" }}
              placeholder="your@email.com"
            />

            {/* סיסמה + אייקון הצגה/הסתרה ממורכז אנכית */}
            <div className="relative">
              <Input
                label="סיסמה"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-[#449ba2] focus:border-[#449ba2]
                           transition-colors duration-200 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* כפתור שליחה בצבע המותג */}
            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={!formData.email || !formData.password || loading}
              className="w-full bg-[#449ba2] hover:bg-[#337e84] text-white py-3 rounded-xl
                         font-semibold shadow-lg hover:shadow-xl transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "מתחבר..." : "התחבר בבטחה"}
            </Button>
          </form>

          {/* לינק לרישום */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              אין לך חשבון?{" "}
              <Link
                to="/register"
                className="font-medium text-[#449ba2] hover:text-[#337e84] transition-colors"
              >
                הירשם כאן
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
