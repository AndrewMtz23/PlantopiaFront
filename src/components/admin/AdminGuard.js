import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSessionData, isAdminSession, isAuthenticated } from "../../utils/session";

const AdminGuard = ({ children }) => {
  const location = useLocation();
  const sessionData = getSessionData();

  if (!isAuthenticated(sessionData)) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdminSession(sessionData)) {
    return <Navigate to="/catalogo" replace />;
  }

  return children;
};

export default AdminGuard;
