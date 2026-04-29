import React, { useEffect, useState } from "react";
import { Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faChartColumn,
  faChevronDown,
  faCompass,
  faHouse,
  faLeaf,
  faRightFromBracket,
  faShieldHalved,
  faMoon,
  faCloudSun,
} from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Axios from "axios";
import { clearSessionData, getSessionData } from "../../utils/session";
import UserAvatar from "../shared/UserAvatar";

const adminLinks = [
  { to: "/cruds", label: "Panel", icon: faHouse },
  { to: "/graficas", label: "Graficas", icon: faChartColumn },
  { to: "/usuarios", label: "Usuarios", icon: faBoxesStacked },
];

const getRoleLabel = (tipo) => (Number(tipo) === 1 ? "Administrador" : "Operador");

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionData = getSessionData();

  const [userData, setUserData] = useState({
    nombre: sessionData?.nombre || "Admin",
    tipo: sessionData?.tipo || 1,
    fotoPerfil: sessionData?.fotoPerfil || "",
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const savedTheme = localStorage.getItem("plantopia_theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const fetchUserData = async () => {
      if (!sessionData?.token) {
        return;
      }

      try {
        const response = await Axios.get("/auth/me");
        if (isMounted && response?.data?.session) {
          setUserData((current) => ({
            ...current,
            ...response.data.session,
            nombre: response.data.session.nombre || current.nombre,
            tipo: response.data.session.tipo ?? current.tipo,
          }));
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [sessionData?.token]);

  const handleLogout = () => {
    clearSessionData();
    navigate("/auth/login", { replace: true });
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextMode = !prev;
      if (nextMode) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("plantopia_theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("plantopia_theme", "light");
      }
      return nextMode;
    });
  };

  return (
    <Navbar expand="lg" className="admin-header">
      <Container fluid className="admin-header__inner admin-shell__container admin-shell__container--wide">
        <Navbar.Brand as={Link} to="/cruds" className="admin-header__brand d-flex align-items-center">
          <span className="admin-header__brand-mark">
            <FontAwesomeIcon icon={faLeaf} />
          </span>
          <span>
            <span className="admin-header__eyebrow">Panel central</span>
            <span className="admin-header__title">Plantopia</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-navbar-nav" />

        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="admin-header__nav mx-auto">
            {adminLinks.map((link) => {
              const isActive =
                location.pathname === link.to ||
                (link.to !== "/cruds" && location.pathname.startsWith(link.to));

              return (
                <Nav.Link
                  key={link.to}
                  as={NavLink}
                  to={link.to}
                  className={`admin-header__nav-link ${isActive ? "admin-header__nav-link--active" : ""}`}
                >
                  <FontAwesomeIcon icon={link.icon} />
                  <span>{link.label}</span>
                </Nav.Link>
              );
            })}
          </Nav>

          <div className="admin-header__actions">
            <button 
              className="admin-header__notification border-0 p-0" 
              onClick={toggleTheme}
              style={{ background: "transparent", cursor: "pointer", width: "42px", height: "42px" }}
              aria-label="Toggle dark mode"
              title="Alternar Modo Oscuro"
            >
              <FontAwesomeIcon icon={isDarkMode ? faCloudSun : faMoon} size="lg" />
            </button>

            <Link to="/graficas" className="admin-header__notification text-decoration-none">
              <FontAwesomeIcon icon={faChartColumn} />
            </Link>

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="admin-profile-dropdown"
                className="admin-header__profile border-0"
            >
                <UserAvatar
                  imagePath={userData.fotoPerfil}
                  name={userData.nombre}
                  className="admin-header__profile-avatar"
                />
                <span className="admin-header__profile-copy">
                  <strong>{userData.nombre || "Admin"}</strong>
                  <small>{getRoleLabel(userData.tipo)}</small>
                </span>
                <FontAwesomeIcon icon={faChevronDown} className="admin-header__profile-caret" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="admin-header__menu">
                <div className="admin-header__menu-summary">
                  <span className="admin-header__menu-eyebrow">Sesion activa</span>
                  <strong>{userData.nombre || "Admin"}</strong>
                  <span>{getRoleLabel(userData.tipo)}</span>
                </div>

                <Dropdown.Item as={Link} to="/perfil" className="admin-header__menu-item">
                  <FontAwesomeIcon icon={faShieldHalved} />
                  <span>Gestionar cuenta</span>
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/" className="admin-header__menu-item">
                  <FontAwesomeIcon icon={faCompass} />
                  <span>Sitio publico</span>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  as="button"
                  type="button"
                  onClick={handleLogout}
                  className="admin-header__menu-item admin-header__menu-item--danger"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>Cerrar sesion</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminHeader;
