const SESSION_KEY = "mySessionData";

const decodeJwtPayload = (token = "") => {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("No se pudo decodificar el token:", error);
    return null;
  }
};

const isTokenExpired = (token = "") => {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
};

const getSessionData = () => {
  const rawData = sessionStorage.getItem(SESSION_KEY);

  if (!rawData) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawData);

    if (!parsed?.token || isTokenExpired(parsed.token)) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("No se pudo leer la sesion:", error);
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const saveSessionData = (data) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

const clearSessionData = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

const getAccessToken = () => getSessionData()?.token || null;

const isAuthenticated = (sessionData) =>
  Boolean(sessionData?.token && sessionData?.idUsuario && sessionData?.correo);

const isAdminSession = (sessionData) =>
  isAuthenticated(sessionData) && Number(sessionData?.tipo) === 1;

const isEmployeeSession = (sessionData) =>
  isAuthenticated(sessionData) && Number(sessionData?.tipo) === 3;

const isCourierSession = (sessionData) =>
  isAuthenticated(sessionData) && Number(sessionData?.tipo) === 4;

const isStaffSession = (sessionData) =>
  isAuthenticated(sessionData) && [1, 3, 4].includes(Number(sessionData?.tipo));

export {
  clearSessionData,
  decodeJwtPayload,
  getAccessToken,
  getSessionData,
  isAdminSession,
  isEmployeeSession,
  isCourierSession,
  isStaffSession,
  isAuthenticated,
  isTokenExpired,
  saveSessionData,
};
