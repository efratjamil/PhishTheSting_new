import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import { API_BASE_URL } from "../../config/apiConfig";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [devResetLink, setDevResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDevResetLink("");

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/forgot-password`,
        { email },
      );

      setSuccess(data.message || "נשלח קישור לאיפוס סיסמה אם קיים חשבון למייל הזה.");
      setDevResetLink(data.resetLink || "");
    } catch (err) {
      setError(err.response?.data?.message || "אירעה שגיאה בשליחת קישור האיפוס.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4 pt-8 md:pt-12 pb-8">
      <div dir="rtl" className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/70 p-5"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e9f4f5] ring-1 ring-[#449ba2]/20 flex items-center justify-center">
              <img src="/iconew.png" alt="PhishTheSting" className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">שכחתי סיסמה</h1>
            <p className="mt-2 text-sm text-gray-600">
              הזן/י את כתובת המייל שלך ונשלח קישור לעדכון הסיסמה.
            </p>
          </div>

          {error && (
            <div className="mb-5">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {success && (
            <div className="mb-5">
              <Alert type="success">{success}</Alert>
            </div>
          )}

          {devResetLink && (
            <div className="mb-5">
              <Alert type="warning" title="קישור פיתוח">
                <a
                  href={devResetLink}
                  className="break-all text-blue-700 underline"
                >
                  {devResetLink}
                </a>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="כתובת אימייל"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              inputProps={{ dir: "ltr" }}
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={!email || loading}
              className="w-full bg-[#449ba2] hover:bg-[#337e84] text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
            >
              {loading ? "שולח..." : "שלח קישור לאיפוס"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="font-medium text-[#449ba2] hover:text-[#337e84] transition-colors"
            >
              חזרה להתחברות
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
