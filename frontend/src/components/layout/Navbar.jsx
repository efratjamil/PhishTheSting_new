import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCircleIcon, 
  Bars3Icon, 
  XMarkIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsMenuOpen(false);
    navigate("/");
  };

  const menuItems = [
    { 
      label: "אזור אישי", 
      path: "/profile", 
      icon: UserCircleIcon 
    },
    { 
      label: "היסטוריית חיפושים", 
      path: "/history", 
      icon: ClockIcon 
    },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={user ? "/analyze" : "/"}
            className="flex items-center space-x-3 rtl:space-x-reverse group"
          >
            <motion.img
              whileHover={{ scale: 1.1, rotate: 5 }}
              src="/iconew.png"
              alt="PhishTheSting Logo"
              className="h-10 w-10"
            />
            <motion.span
              className="text-xl font-bold font-display text-white group-hover:text-secondary-400 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
            >
              PhishTheSting
            </motion.span>
          </Link>

          {/* Desktop Menu */}
          {user && !["/", "/login", "/register"].includes(location.pathname) && (
            <div className="hidden md:block">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 rtl:space-x-reverse text-white hover:text-secondary-400 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                >
                  <UserCircleIcon className="h-8 w-8" />
                  <span className="font-medium">{user.firstName}</span>
                </motion.button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2"
                    >
                      {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              to={item.path}
                              className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition-colors duration-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                      <hr className="my-2 border-neutral-200" />
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: menuItems.length * 0.1 }}
                        onClick={handleLogout}
                        className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 text-danger-600 hover:bg-danger-50 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span>התנתק</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && !["/", "/login", "/register"].includes(location.pathname) && (
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-secondary-400 transition-colors duration-200 p-2"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/20 mt-4 pt-4 pb-4"
            >
              <div className="space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: menuItems.length * 0.1 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>התנתק</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;