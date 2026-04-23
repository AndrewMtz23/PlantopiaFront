import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLeaf,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../logos.png";
import "../css/PublicSite.css";

const Footer = () => {
  return (
    <footer className="public-footer">
      <div className="public-shell public-footer__grid">
        <div className="public-footer__brand">
          <div className="public-footer__logo">
            <img src={logo} alt="Plantopia" />
          </div>
          <div>
            <strong>Plantopia</strong>
            <p>
              Una experiencia botanica mas curada para hogar, oficina, regalos y
              compras con mejor contexto.
            </p>
          </div>
        </div>

        <div className="public-footer__column">
          <span>Explorar</span>
          <Link to="/colecciones">Colecciones</Link>
          <Link to="/cuidados">Guia de cuidados</Link>
          <Link to="/envios">Envios</Link>
          <Link to="/regalos-botanicos">Regalos botanicos</Link>
        </div>

        <div className="public-footer__column">
          <span>Marca</span>
          <Link to="/acerca de">Acerca de</Link>
          <Link to="/cia">Estudio comercial</Link>
          <Link to="/preguntas">Preguntas frecuentes</Link>
          <Link to="/auth/login">Acceso</Link>
        </div>

        <div className="public-footer__column">
          <span>Contacto</span>
          <a href="mailto:info@plantopia.com">
            <FontAwesomeIcon icon={faEnvelope} />
            info@plantopia.com
          </a>
          <a href="tel:+521234567890">
            <FontAwesomeIcon icon={faPhone} />
            +52 123 456 7890
          </a>
          <p>
            <FontAwesomeIcon icon={faLocationDot} />
            Ciudad de Mexico, envios seleccionados a todo el pais.
          </p>
        </div>
      </div>

      <div className="public-shell public-footer__bottom">
        <p>
          <FontAwesomeIcon icon={faLeaf} /> Plantopia {new Date().getFullYear()}.
          Hecho para vender mejor y verse mucho mas vivo.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
