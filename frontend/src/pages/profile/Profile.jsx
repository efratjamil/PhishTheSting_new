import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  UserCircleIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";
import PasswordRequirements from "../../components/ui/PasswordRequirements";
import {
  clearAuthSession,
  getAuthHeaders,
  getStoredUser,
  storeAuthSession,
} from "../../utils/auth";
import { isStrongPassword } from "../../utils/validation";
import { API_BASE_URL } from "../../config/apiConfig";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalScans: 0,
    suspiciousScans: 0,
    safeScans: 0,
    totalCheckedLinks: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setUser(u);
      setProfileData({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
      });
    } else {
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/analyze/dashboard`,
          {
            headers: getAuthHeaders(),
          }
        );

        setDashboardStats({
          totalScans: response.data?.stats?.totalScans || 0,
          suspiciousScans: response.data?.stats?.suspiciousScans || 0,
          safeScans: response.data?.stats?.safeScans || 0,
          totalCheckedLinks: response.data?.stats?.totalCheckedLinks || 0,
        });
      } catch (err) {
        if (err.response?.status === 401) {
          clearAuthSession();
          navigate("/login");
          return;
        }

        console.error(
          "Failed to fetch dashboard stats:",
          err.response?.data || err.message
        );
      } finally {
        setStatsLoading(false);
      }
    };

    if (getStoredUser()?.id) {
      fetchDashboardStats();
    } else {
      setStatsLoading(false);
    }
  }, [navigate]);

  const statCards = [
    {
      label: "הודעות שנבדקו",
      value: dashboardStats.totalScans,
      icon: DocumentTextIcon,
      tone: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "הודעות חשודות",
      value: dashboardStats.suspiciousScans,
      icon: ExclamationTriangleIcon,
      tone: "text-danger-600 bg-danger-50 border-danger-100",
    },
    {
      label: "הודעות תקינות",
      value: dashboardStats.safeScans,
      icon: ShieldCheckIcon,
      tone: "text-success-600 bg-success-50 border-success-100",
    },
    {
      label: "קישורים שנבדקו",
      value: dashboardStats.totalCheckedLinks,
      icon: LinkIcon,
      tone: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswords = () => {
    const newErrors = {};
    if (!passwordData.newPassword)
      newErrors.newPassword = "יש להזין סיסמה חדשה";
    else if (!isStrongPassword(passwordData.newPassword))
      newErrors.newPassword = "הסיסמה חייבת לכלול 8 תווים, אות גדולה, מספר ותו מיוחד";
    if (!passwordData.confirmPassword)
      newErrors.confirmPassword = "יש להזין אימות סיסמה";
    else if (passwordData.newPassword !== passwordData.confirmPassword)
      newErrors.confirmPassword = "הסיסמאות אינן תואמות";
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
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/update-password`,
        {
          newPassword: passwordData.newPassword,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      setSuccess(response.data.message || "הסיסמה עודכנה בהצלחה");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuthSession();
        navigate("/login");
        return;
      }

      setErrors({
        general: err.response?.data?.message || "אירעה שגיאה בעדכון הסיסמה",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setErrors({ general: "יש למלא שם פרטי ושם משפחה" });
      return;
    }
    setUpdating(true);
    setErrors({});
    setSuccess(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/update-profile`,
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      const updated = response.data.user;
      storeAuthSession({ user: updated });
      setUser(updated);
      setProfileData({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
      });
      setSuccess("הפרטים עודכנו בהצלחה");
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuthSession();
        navigate("/login");
        return;
      }

      setErrors({
        general: err.response?.data?.message || "אירעה שגיאה בעדכון הפרטים",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircleIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-2">
              אזור אישי
            </h1>
            <p className="text-gray-600">נהל/י את פרטי החשבון והסיסמה שלך</p>
          </div>

          <div className="space-y-8">
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  דשבורד אישי
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  סיכום קצר של הבדיקות שביצעת במערכת
                </p>
              </div>

              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <div
                        key={card.label}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-gray-500">{card.label}</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                              {card.value}
                            </p>
                          </div>
                          <div
                            className={`rounded-full border p-3 ${card.tone}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-3 rtl:space-x-reverse">
                <UserCircleIcon className="w-6 h-6 text-blue-600" />
                <span>פרטי משתמש</span>
              </h2>
              {user && (
                <div className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">
                            שם פרטי
                          </label>
                          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                            {user.firstName}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">
                            שם משפחה
                          </label>
                          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                            {user.lastName}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-500 mb-2">
                            דוא"ל
                          </label>
                          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          עריכה
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {errors.general && (
                        <Alert type="error" className="mb-2">
                          {errors.general}
                        </Alert>
                      )}
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label="שם פרטי"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                        />
                        <Input
                          label="שם משפחה"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                        />
                        <div className="md:col-span-2">
                          <Input
                            label="דואל"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileData({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                            });
                          }}
                        >
                          ביטול
                        </Button>
                        <Button
                          onClick={handleProfileUpdate}
                          loading={updating}
                        >
                          שמירה
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-3 rtl:space-x-reverse">
                <KeyIcon className="w-6 h-6 text-blue-600" />
                <span>עדכון סיסמה</span>
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
                    className="input-field pr-12"
                    placeholder="הקלד/י סיסמה חדשה"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute left-3 top-9 text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <PasswordRequirements password={passwordData.newPassword} />
                <div className="relative">
                  <Input
                    label="אימות סיסמה"
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={errors.confirmPassword}
                    className="input-field pr-12"
                    placeholder="הקלד/י שוב את הסיסמה"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute left-3 top-9 text-gray-500 hover:text-gray-900 transition-colors"
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
                  disabled={
                    !passwordData.newPassword || !passwordData.confirmPassword
                  }
                  className="w-full"
                >
                  {updating ? "מעדכן/ת..." : "עדכון סיסמה"}
                </Button>
              </form>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
