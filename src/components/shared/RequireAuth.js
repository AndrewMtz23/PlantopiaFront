import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSessionData, isAuthenticated } from "../../utils/session";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const sessionData = getSessionData();

  if (!isAuthenticated(sessionData)) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;
