import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faLeaf,
  faShieldHalved,
  faStore,
} from "@fortawesome/free-solid-svg-icons";

const currentYear = new Date().getFullYear();

const footerLinks = [
  { to: "/cruds", label: "Panel", icon: faShieldHalved },
  { to: "/graficas", label: "Graficas", icon: faChartColumn },
  { to: "/catalogo", label: "Tienda", icon: faStore },
];

const AdminFooter = () => {
  return (
    <footer className="admin-footer">
      <div className="admin-footer__content admin-shell__container admin-shell__container--wide">
        <div className="admin-footer__brand">
          <span className="admin-footer__brand-mark">
            <FontAwesomeIcon icon={faLeaf} />
          </span>
          <div>
            <span className="admin-footer__eyebrow">Workspace</span>
            <strong>Plantopia Admin</strong>
            <p>Centro operativo para control comercial, catalogo e inteligencia del sitio.</p>
          </div>
        </div>

        <nav className="admin-footer__nav" aria-label="Atajos del panel">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="admin-footer__link">
              <FontAwesomeIcon icon={link.icon} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-footer__meta">
          <span>Sesion administrativa segura</span>
          <strong>{currentYear} Plantopia Workspace</strong>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
