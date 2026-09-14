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
import { API_BASE_URL } from "../../config/apiConfig";

const TEXT = {
  firstNameRequired: "שם פרטי נדרש",
  lastNameRequired: "שם משפחה נדרש",
  emailRequired: "כתובת אימייל נדרשת",
  emailInvalid: "כתובת אימייל לא תקינה",
  passwordRequired: "סיסמה נדרשת",
  passwordWeak: "הסיסמה חייבת לכלול 8 תווים, אות גדולה, מספר ותו מיוחד",

  genericError: "אירעה שגיאה, נסה שוב מאוחר יותר.",

  successTitle: "נרשמת בהצלחה!",
  successBody: "מעביר אותך לדף ההתחברות...",

  register: "הרשמה",

  firstName: "שם פרטי",
  lastName: "שם משפחה",

  email: "כתובת אימייל",
  password: "סיסמה",

  hidePassword: "הסתר סיסמה",
  showPassword: "הצג סיסמה",

  submitLoading: "נרשם...",
  submit: "הירשם בבטחה",

  haveAccount: "כבר יש לך חשבון?",
  loginHere: "התחבר כאן",
};

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
    if (isEmptyField(formData.firstName))
      newErrors.firstName = TEXT.firstNameRequired;
    if (isEmptyField(formData.lastName))
      newErrors.lastName = TEXT.lastNameRequired;
    if (isEmptyField(formData.email)) newErrors.email = TEXT.emailRequired;
    else if (!isValidEmail(formData.email)) newErrors.email = TEXT.emailInvalid;
    if (isEmptyField(formData.password))
      newErrors.password = TEXT.passwordRequired;
    else if (!isStrongPassword(formData.password))
      newErrors.password = TEXT.passwordWeak;
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
      await axios.post(`${API_BASE_URL}/register`, formData);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || TEXT.genericError,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top,_rgba(68,155,162,0.14),_transparent_40%),linear-gradient(180deg,_#f7fbfb_0%,_#eef5f5_100%)] px-4 py-6">
        <div className="flex min-h-[calc(100vh-112px)] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="max-w-sm rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200/70">
              <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-green-600" />
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {TEXT.successTitle}
              </h2>
              <p className="text-gray-600">{TEXT.successBody}</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top,_rgba(68,155,162,0.14),_transparent_40%),linear-gradient(180deg,_#f7fbfb_0%,_#eef5f5_100%)] px-4 py-3 md:py-4">
      <div className="flex min-h-[calc(100vh-88px)] items-center justify-center">
        <div dir="rtl" className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-[#449ba2]/10 lg:grid lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="hidden flex-col justify-between bg-[linear-gradient(180deg,_#dff0f1_0%,_#f4fbfb_100%)] p-8 lg:flex xl:p-10">
              <div>
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#449ba2]/15">
                  <img
                    src="/iconew.png"
                    alt="PhishTheSting"
                    className="h-10 w-10"
                  />
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#337e84]">
                  הרשמה{" "}
                </p>
                <h1 className="mb-4 text-4xl font-bold leading-tight text-slate-900">
                  {TEXT.heroTitleLine1}
                  <br />
                  {TEXT.heroTitleLine2}
                </h1>
                <p className="max-w-sm text-sm leading-6 text-slate-600">
                  {TEXT.heroBody}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-white">
                  {TEXT.compactForm}
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-white">
                  {TEXT.desktopFit}
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 lg:p-7 xl:p-8">
              <div className="mb-5 text-center lg:hidden">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45 }}
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f4f5] ring-1 ring-[#449ba2]/20"
                >
                  <img
                    src="/iconew.png"
                    alt="PhishTheSting"
                    className="h-9 w-9"
                  />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {TEXT.register}
                </h1>
              </div>

              {errors.general && (
                <div className="mb-4">
                  <Alert type="error">{errors.general}</Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label={TEXT.firstName}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors duration-200 focus:border-[#449ba2] focus:outline-none focus:ring-2 focus:ring-[#449ba2]"
                    placeholder={TEXT.firstNamePlaceholder}
                  />
                  <Input
                    label={TEXT.lastName}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors duration-200 focus:border-[#449ba2] focus:outline-none focus:ring-2 focus:ring-[#449ba2]"
                    placeholder={TEXT.lastNamePlaceholder}
                  />
                </div>

                <Input
                  label={TEXT.email}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors duration-200 focus:border-[#449ba2] focus:outline-none focus:ring-2 focus:ring-[#449ba2]"
                  inputProps={{ dir: "ltr" }}
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {TEXT.password}
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
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm transition-colors duration-200 focus:border-[#449ba2] focus:outline-none focus:ring-2 focus:ring-[#449ba2]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 left-3 flex items-center text-gray-400 transition-colors hover:text-gray-600"
                      aria-label={
                        showPassword ? TEXT.hidePassword : TEXT.showPassword
                      }
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <PasswordRequirements password={formData.password} />

                <Button
                  type="submit"
                  loading={loading}
                  disabled={
                    Object.values(formData).some((v) => !v.trim()) || loading
                  }
                  className="w-full rounded-xl bg-[#449ba2] py-2.5 text-white shadow-lg transition-all duration-200 hover:bg-[#337e84] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? TEXT.submitLoading : TEXT.submit}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <p className="text-gray-600">
                  {TEXT.haveAccount}
                  <Link
                    to="/login"
                    className="mr-1 font-medium text-[#449ba2] transition-colors hover:text-[#337e84]"
                  >
                    {TEXT.loginHere}
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
