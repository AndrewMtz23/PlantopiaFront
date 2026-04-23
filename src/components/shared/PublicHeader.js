import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRightFromBracket,
  faChevronDown,
  faComments,
  faEnvelope,
  faHeart,
  faRightToBracket,
  faSearch,
  faShieldHalved,
  faShop,
  faShoppingCart,
  faUser,
  faBars,
  faXmark,
  faMoon,
  faCloudSun,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../logos.png";
import {
  clearSessionData,
  getSessionData,
  isAdminSession,
  isAuthenticated,
} from "../../utils/session";
import "../css/PublicHeader.css";

const publicLinks = [
  { to: "/Acerca de", label: "Acerca de", icon: faComments },
  { to: "/Cia", label: "Cia", icon: faEnvelope },
];

const PublicHeader = ({
  actionLinks = [],
  authMode = false,
  backLabel = "Regresar",
  backTo = "/",
  searchTerm = "",
  onSearchTermChange,
  onSearchSubmit,
  searchPlaceholder = "Buscar plantas...",
}) => {
  const navigate = useNavigate();
  const sessionData = getSessionData();
  const isLoggedIn = isAuthenticated(sessionData);
  const isAdmin = isAdminSession(sessionData);
  const userLabel = sessionData?.nombre || "Mi cuenta";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Dark Mode State & Logic
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("plantopia_theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

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

  const handleLogout = () => {
    clearSessionData();
    navigate("/auth/login");
  };

  return (
    <header className="public-header">
      <div className="public-header__shell public-header__container">
        <div className="public-header__mobile-top">
          <Link to="/" className="public-header__brand">
            <img src={logo} alt="Logo" className="public-header__brand-logo" />
            <span className="public-header__brand-wordmark">Plantopia</span>
          </Link>

          <button 
            className="public-header__hamburger" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faXmark : faBars} size="lg" />
          </button>
        </div>

        <div className={`public-header__actions ${isMobileMenuOpen ? "public-header__actions--open" : ""}`}>
          {onSearchSubmit && onSearchTermChange ? (
            <form onSubmit={(e) => { e.preventDefault(); onSearchSubmit(e); setIsMobileMenuOpen(false); }} className="public-header__search" role="search">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
              />
              <button type="submit" aria-label="Buscar">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </form>
          ) : null}

          <nav className="public-header__nav" aria-label="Navegacion principal">
            <ul className="public-header__links">
              {publicLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `public-header__nav-link ${isActive ? "public-header__nav-link--active" : ""}`
                    }
                  >
                    <FontAwesomeIcon icon={link.icon} />
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              ))}
              {actionLinks.map((link) => (
                <li key={`${link.to}-${link.label}`}>
                  <NavLink
                    to={link.to}
                    onClick={link.onClick}
                    className={({ isActive }) =>
                      `public-header__nav-link public-header__nav-link--compact ${
                        isActive ? "public-header__nav-link--active" : ""
                      }`
                    }
                  >
                    {link.icon ? <FontAwesomeIcon icon={link.icon} /> : null}
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="public-header__account-zone">
            <button 
              className="public-header__secondary-link" 
              onClick={toggleTheme}
              style={{ border: "none", cursor: "pointer", background: "transparent", minWidth: "48px", padding: "0" }}
              aria-label="Toggle dark mode"
              title="Alternar Modo Oscuro"
            >
              <FontAwesomeIcon icon={isDarkMode ? faCloudSun : faMoon} size="lg" />
            </button>

            {authMode ? (
              <Link to={backTo} className="public-header__secondary-link public-header__back-link">
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>{backLabel}</span>
              </Link>
            ) : isLoggedIn ? (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    id="public-profile-dropdown"
                    className="public-header__profile"
                  >
                    <span className="public-header__profile-avatar">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <span className="public-header__profile-copy">
                      <strong>{userLabel}</strong>
                      <small>{isAdmin ? "Administrador" : "Sesion activa"}</small>
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className="public-header__profile-caret" />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="public-header__menu">
                    <div className="public-header__menu-summary">
                      <strong>{userLabel}</strong>
                      <span>{isAdmin ? "Administrador" : "Cliente Plantopia"}</span>
                      <span className="public-header__menu-badge">
                        {isAdmin ? "ADMIN" : "ACTIVO"}
                      </span>
                    </div>

                    <Dropdown.Item
                      as={Link}
                      to={isAdmin ? "/cruds" : "/catalogo"}
                      className="public-header__menu-item"
                    >
                      <FontAwesomeIcon icon={isAdmin ? faShieldHalved : faShop} />
                      <span>{isAdmin ? "Panel Administrativo" : "Ir al catalogo"}</span>
                    </Dropdown.Item>

                    {!isAdmin && (
                      <Dropdown.Item
                        as={Link}
                        to="/carrito"
                        className="public-header__menu-item"
                      >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span>Mi carrito</span>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item
                      as={Link}
                      to={isAdmin ? "/usuarios" : "/lista"}
                      className="public-header__menu-item"
                    >
                      <FontAwesomeIcon icon={isAdmin ? faUser : faHeart} />
                      <span>{isAdmin ? "Gestionar cuenta" : "Mis favoritos"}</span>
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Dropdown.Item
                      as="button"
                      type="button"
                      onClick={handleLogout}
                      className="public-header__menu-item public-header__menu-item--danger"
                    >
                      <FontAwesomeIcon icon={faArrowRightFromBracket} />
                      <span>Cerrar sesion</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="public-header__secondary-link">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Iniciar sesion</span>
                </Link>
                <Link to="/auth/register" className="public-header__primary-link">
                  <FontAwesomeIcon icon={faRightToBracket} />
                  <span>Registrate ahora</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
