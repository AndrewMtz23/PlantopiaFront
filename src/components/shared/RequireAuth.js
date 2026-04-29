import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSessionData, isAuthenticated } from "../../utils/session";

const RequireAuth = ({ children, allowedRoles = null }) => {
  const location = useLocation();
  const sessionData = getSessionData();

  if (!isAuthenticated(sessionData)) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(Number(sessionData.tipo))) {
    return <Navigate to={Number(sessionData.tipo) === 2 ? "/catalogo" : "/cruds"} replace />;
  }

  return children;
};

export default RequireAuth;
