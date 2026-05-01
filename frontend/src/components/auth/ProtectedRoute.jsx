import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearAuthSession, fetchCurrentUser, getAuthToken } from "../../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = getAuthToken();

      if (!token) {
        if (isMounted) {
          setStatus("unauthenticated");
        }
        return;
      }

      try {
        const user = await fetchCurrentUser();

        if (isMounted) {
          setStatus(user ? "authenticated" : "unauthenticated");
        }
      } catch (error) {
        clearAuthSession();
        if (isMounted) {
          setStatus("unauthenticated");
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
