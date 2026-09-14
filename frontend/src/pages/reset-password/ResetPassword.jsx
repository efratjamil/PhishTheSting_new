import { useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import PasswordRequirements from "../../components/ui/PasswordRequirements";
import { isStrongPassword } from "../../utils/validation";
import { API_BASE_URL } from "../../config/apiConfig";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("קישור האיפוס אינו תקין.");
      return;
    }

    if (!isStrongPassword(formData.newPassword)) {
      setError("הסיסמה חייבת לכלול 8 תווים, אות גדולה, מספר ותו מיוחד.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/reset-password`,
        {
          token,
          newPassword: formData.newPassword,
        },
      );

      setSuccess(data.message || "הסיסמה עודכנה בהצלחה.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "אירעה שגיאה באיפוס הסיסמה.");
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
            <h1 className="text-2xl font-bold text-gray-900">עדכון סיסמה</h1>
            <p className="mt-2 text-sm text-gray-600">
              בחר/י סיסמה חדשה לחשבון שלך.
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="סיסמה חדשה"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                required
                placeholder="הקלד/י סיסמה חדשה"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <PasswordRequirements password={formData.newPassword} />

            <div className="relative">
              <Input
                label="אימות סיסמה"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                placeholder="הקלד/י שוב את הסיסמה"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={!formData.newPassword || !formData.confirmPassword || loading}
              className="w-full bg-[#449ba2] hover:bg-[#337e84] text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
            >
              {loading ? "מעדכן..." : "עדכון סיסמה"}
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
