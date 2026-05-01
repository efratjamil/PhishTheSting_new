import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import PasswordRequirements from "../../components/ui/PasswordRequirements";
import {
  isEmptyField,
  isValidEmail,
  isStrongPassword,
} from "../../utils/validation";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (isEmptyField(formData.firstName)) newErrors.firstName = "שם פרטי נדרש";
    if (isEmptyField(formData.lastName)) newErrors.lastName = "שם משפחה נדרש";
    if (isEmptyField(formData.email)) newErrors.email = "כתובת אימייל נדרשת";
    else if (!isValidEmail(formData.email))
      newErrors.email = "כתובת אימייל לא תקינה";
    if (isEmptyField(formData.password)) newErrors.password = "סיסמה נדרשת";
    else if (!isStrongPassword(formData.password))
      newErrors.password = "הסיסמה חייבת לכלול 8 תווים, אות גדולה, מספר ותו מיוחד";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await axios.post("http://localhost:5000/register", formData);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors({
        general:
          err.response?.data?.message || "אירעה שגיאה, נסה שוב מאוחר יותר.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4 pt-8 md:pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/70 p-8 max-w-sm">
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              נרשמת בהצלחה!
            </h2>
            <p className="text-gray-600">מעבירה אותך לדף ההתחברות…</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-start justify-center px-4 pt-8 md:pt-6 pb-4">
      <div dir="rtl" className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/70 p-8"
        >
          {/* לוגו + כותרת */}
          <div className="text-center mb-6">
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
            <h1 className="text-2xl font-bold text-gray-900">הרשמה</h1>
          </div>

          {errors.general && (
            <div className="mb-6">
              <Alert type="error">{errors.general}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="שם פרטי"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-[#449ba2] focus:border-[#449ba2]
                           transition-colors duration-200"
                placeholder="יוחנן"
              />
              <Input
                label="שם משפחה"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-[#449ba2] focus:border-[#449ba2]
                           transition-colors duration-200"
                placeholder="כהן"
              />
            </div>

            {/* אימייל ב-LTR */}
            <Input
              label="כתובת אימייל"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#449ba2] focus:border-[#449ba2]
                         transition-colors duration-200"
              inputProps={{ dir: "ltr" }}
              placeholder="your@email.com"
            />

            {/* סיסמה + אייקון ממורכז */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
              {errors.password ? (
                <span className="text-red-500"> *</span>
              ) : (
                " *"
              )}
            </label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white
                           focus:outline-none focus:ring-2 focus:ring-[#449ba2] focus:border-[#449ba2]
                           transition-colors duration-200 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <PasswordRequirements password={formData.password} />

            {/* כפתור הגשה בצבע מותג */}
            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={
                Object.values(formData).some((v) => !v.trim()) || loading
              }
              className="w-full bg-[#449ba2] hover:bg-[#337e84] text-white py-3 rounded-xl
                         font-semibold shadow-lg hover:shadow-xl transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "נרשם..." : "הירשם בבטחה"}
            </Button>
          </form>

          {/* לינק התחברות */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              כבר יש לך חשבון?
              <Link
                to="/login"
                className="font-medium text-[#449ba2] hover:text-[#337e84] transition-colors"
              >
                התחבר כאן
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
