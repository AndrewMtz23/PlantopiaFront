import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../shared/PublicHeader";
import Footer from "../decoraciones/footer";
import { getSessionData, isAdminSession, isAuthenticated } from "../../utils/session";

const resolveSearchDestination = (term, sessionData) => {
  const query = term.trim().toLowerCase();
  const loggedIn = isAuthenticated(sessionData);
  const isAdmin = isAdminSession(sessionData);

  if (!query) {
    return loggedIn ? (isAdmin ? "/cruds" : "/catalogo") : "/colecciones";
  }

  if (query.includes("cuidado") || query.includes("riego") || query.includes("guia")) {
    return "/cuidados";
  }

  if (
    query.includes("envio") ||
    query.includes("entrega") ||
    query.includes("sucursal") ||
    query.includes("oficina")
  ) {
    return "/envios";
  }

  if (query.includes("regalo") || query.includes("detalle")) {
    return "/regalos-botanicos";
  }

  if (query.includes("coleccion") || query.includes("interior") || query.includes("suculenta")) {
    return "/colecciones";
  }

  return loggedIn ? (isAdmin ? "/cruds" : "/catalogo") : "/colecciones";
};

const PublicPageLayout = ({ children, searchPlaceholder = "Buscar plantas..." }) => {
  const navigate = useNavigate();
  const sessionData = getSessionData();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(resolveSearchDestination(searchTerm, sessionData));
  };

  return (
    <div className="homepage public-site">
      <PublicHeader
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder={searchPlaceholder}
      />
      <main className="public-site__main">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicPageLayout;
