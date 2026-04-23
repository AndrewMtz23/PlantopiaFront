import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCompass,
  faGift,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import { remoteImages } from "../siteContent";

const HomeHeroSection = ({ isLoggedIn, isAdmin }) => (
  <section className="public-hero">
    <div className="public-shell public-hero__grid">
      <div className="public-hero__content">
        <span className="public-hero__eyebrow">Colecciones vivas para hogar y oficina</span>
        <h1 className="public-hero__title">
          Plantas que se sienten curadas, no solo listadas.
        </h1>
        <p className="public-hero__copy">
          Descubre piezas botanicas, regalos verdes y combinaciones listas para
          transformar un rincon comun en un espacio que si se antoja habitar.
        </p>

        <div className="public-hero__actions">
          <Link
            to={isLoggedIn ? (isAdmin ? "/cruds" : "/catalogo") : "/colecciones"}
            className="public-button public-button--primary"
          >
            {isLoggedIn ? "Ir a mi espacio" : "Explorar colecciones"}
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
          <Link to="/regalos-botanicos" className="public-button public-button--ghost">
            <FontAwesomeIcon icon={faGift} />
            Regalos botanicos
          </Link>
        </div>

        <div className="public-hero__tags">
          <span>
            <FontAwesomeIcon icon={faLeaf} />
            Interior editorial
          </span>
          <span>
            <FontAwesomeIcon icon={faCompass} />
            Guiado por estilo
          </span>
        </div>
      </div>

      <div className="public-hero__visual">
        <div className="public-hero__image-stack">
          <article className="public-hero__primary-shot">
            <img src={remoteImages.heroMain} alt="Coleccion principal de Plantopia" />
          </article>
          <article className="public-hero__secondary-shot">
            <img src={remoteImages.heroSecondary} alt="Detalle de suculentas y follajes" />
          </article>
          <div className="public-hero__floating-card">
            <strong>Drop editorial</strong>
            <span>Curaduria semanal de piezas para sala, estudio y regalos.</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HomeHeroSection;
