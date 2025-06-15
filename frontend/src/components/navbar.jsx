import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // נשתמש בזה כדי לבדוק אם אנחנו בעמוד הבית

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    // 🛠️ פתרון לבעיה – סגירת התפריט בכל שינוי עמוד:
    setAnchorEl(null);
  }, [location.pathname]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "rgba(0, 0, 0, 0.4)",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(8px)",
        height: "70px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1400px",
          padding: "0 20px",
        }}
      >
        <Box>
          <Link
            to={user ? "/analyze" : "/"}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src="/iconew.png"
              alt="PhishTheSting Logo"
              style={{
                height: "40px",
                width: "auto",
                marginRight: "10px",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                letterSpacing: "1px",
                color: "white",
                fontFamily: "Poppins, sans-serif",
                transition: "color 0.3s ease-in-out",
                "&:hover": { color: "#00e6e6" },
              }}
            >
              PhishTheSting
            </Typography>
          </Link>
        </Box>

        {/* ❌ אל תציג את האייקון אם אנחנו בעמוד הבית */}
        {user && !["/", "/login", "/register"].includes(location.pathname) && (
          <Box>
            <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
              <AccountCircleIcon fontSize="large" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ mt: "40px" }}
            >
              <MenuItem onClick={() => navigate("/profile")}>
                אזור אישי
              </MenuItem>
              <MenuItem onClick={() => navigate("/history")}>
                היסטוריית חיפושים
              </MenuItem>
              <MenuItem onClick={handleLogout}>התנתק</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
