import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  UserCircleIcon, 
  KeyIcon, 
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validatePasswords = () => {
    const newErrors = {};
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = "סיסמה חדשה נדרשת";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "הסיסמה צריכה להכיל לפחות 6 תווים";
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "אימות סיסמה נדרש";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "הסיסמאות אינן תואמות";
    }
    
    return newErrors;
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    const newErrors = validatePasswords();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setUpdating(true);
    setErrors({});
    setSuccess(null);

    try {
      const response = await axios.post("http://localhost:5000/update-password", {
        email: user.email,
        newPassword: passwordData.newPassword,
      });

      setSuccess(response.data.message);
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "שגיאה בעת עדכון הסיסמה"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircleIcon className="w-10 h-10 text-primary-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-2">
              אזור אישי
            </h1>
            <p className="text-neutral-300">
              נהל את הפרטים האישיים שלך
            </p>
          </div>

          <div className="space-y-8">
            {/* User Info */}
            <Card className="card-dark">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3 rtl:space-x-reverse">
                <UserCircleIcon className="w-6 h-6 text-primary-400" />
                <span>פרטים אישיים</span>
              </h2>
              
              {user && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      שם פרטי
                    </label>
                    <div className="px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white">
                      {user.firstName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      שם משפחה
                    </label>
                    <div className="px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white">
                      {user.lastName}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      כתובת אימייל
                    </label>
                    <div className="px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white">
                      {user.email}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Password Update */}
            <Card className="card-dark">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3 rtl:space-x-reverse">
                <KeyIcon className="w-6 h-6 text-primary-400" />
                <span>שינוי סיסמה</span>
              </h2>

              {success && (
                <div className="mb-6">
                  <Alert type="success" title="הצלחה!">
                    {success}
                  </Alert>
                </div>
              )}

              {errors.general && (
                <div className="mb-6">
                  <Alert type="error">{errors.general}</Alert>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="relative">
                  <Input
                    label="סיסמה חדשה"
                    name="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={errors.newPassword}
                    className="input-field-dark pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute left-3 top-9 text-neutral-400 hover:text-white transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="אימות סיסמה"
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={errors.confirmPassword}
                    className="input-field-dark pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute left-3 top-9 text-neutral-400 hover:text-white transition-colors"
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
                  loading={updating}
                  disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                  className="w-full"
                >
                  {updating ? "מעדכן..." : "עדכן סיסמה"}
                </Button>
              </form>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}