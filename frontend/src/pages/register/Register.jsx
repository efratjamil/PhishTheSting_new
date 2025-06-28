import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";
import { isEmptyField, isValidEmail, isStrongPassword } from "../../utils/validation";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isEmptyField(formData.firstName)) {
      newErrors.firstName = "שם פרטי נדרש";
    }
    
    if (isEmptyField(formData.lastName)) {
      newErrors.lastName = "שם משפחה נדרש";
    }
    
    if (isEmptyField(formData.email)) {
      newErrors.email = "כתובת אימייל נדרשת";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "כתובת אימייל לא תקינה";
    }
    
    if (isEmptyField(formData.password)) {
      newErrors.password = "סיסמה נדרשת";
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password = "הסיסמה צריכה להכיל לפחות 6 תווים";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
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
        general: err.response?.data?.message || "אירעה שגיאה, נסה שוב מאוחר יותר."
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="card-dark max-w-md">
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 text-success-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                נרשמת בהצלחה!
              </h2>
              <p className="text-neutral-300">
                מועבר לדף התחברות...
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="card-dark">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <img src="/iconew.png" alt="Logo" className="w-10 h-10" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                הצטרף אלינו
              </h1>
              <p className="text-neutral-400">
                צור חשבון חדש והתחל להגן על עצמך
              </p>
            </div>

            {errors.general && (
              <div className="mb-6">
                <Alert type="error">{errors.general}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="שם פרטי"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                  className="input-field-dark"
                  placeholder="יוחנן"
                />
                <Input
                  label="שם משפחה"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                  className="input-field-dark"
                  placeholder="כהן"
                />
              </div>

              <Input
                label="כתובת אימייל"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                className="input-field-dark"
                placeholder="your@email.com"
              />

              <div className="relative">
                <Input
                  label="סיסמה"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  className="input-field-dark pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-9 text-neutral-400 hover:text-white transition-colors"
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
                className="w-full"
                size="lg"
                loading={loading}
                disabled={Object.values(formData).some(value => !value.trim())}
              >
                {loading ? "נרשם..." : "הירשם"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-neutral-400">
                כבר יש לך חשבון?{" "}
                <Link
                  to="/login"
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  התחבר כאן
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}