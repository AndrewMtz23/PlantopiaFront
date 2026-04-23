import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faLeaf, faShieldHeart, faStar } from "@fortawesome/free-solid-svg-icons";
import PublicPageLayout from "./public/PublicPageLayout";
import SectionHeading from "./public/SectionHeading";
import { aboutValues, remoteImages } from "./public/siteContent";
import "./css/PublicSite.css";

const About = () => {
  return (
    <PublicPageLayout searchPlaceholder="Busca colecciones, envios o guias">
      <section className="public-page-hero">
        <div className="public-shell public-page-hero__grid">
          <div>
            <span className="public-page-hero__eyebrow">Acerca de Plantopia</span>
            <h1 className="public-page-hero__title">Una marca botanica que quiere vender con criterio.</h1>
            <p className="public-page-hero__copy">
              Plantopia esta migrando de un proyecto escolar a una experiencia
              comercial mas cuidada: visualmente mas fuerte, mas clara y con
              rutas que invitan a comprar de verdad.
            </p>
            <div className="public-inline-actions">
              <Link to="/colecciones" className="public-button public-button--primary">
                Ver colecciones
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/cuidados" className="public-button public-button--ghost">
                Guia de cuidados
              </Link>
            </div>
          </div>
          <div className="public-page-hero__visual">
            <img src={remoteImages.team} alt="Equipo trabajando en curaduria botanica" />
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-shell">
          <SectionHeading
            eyebrow="Nuestro enfoque"
            title="No se trata solo de listar productos"
            copy="Queremos que una persona entre, entienda el estilo de la marca, confie en la experiencia y encuentre mas rapido algo que quiera llevarse."
          />

          <div className="public-editorial-grid">
            {aboutValues.map((value, index) => (
              <article key={value.title} className="public-editorial-card">
                <span className="public-editorial-card__index">0{index + 1}</span>
                <h3>{value.title}</h3>
                <p>{value.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section--muted">
        <div className="public-shell public-split-grid">
          <div className="public-story-card">
            <img src={remoteImages.greenhouse} alt="Invernadero con diferentes especies" />
          </div>
          <div className="public-split-copy">
            <SectionHeading
              eyebrow="Direccion"
              title="Plantopia ahora se piensa como boutique botanica digital"
              copy="Eso significa menos ruido, mejores decisiones visuales, contenido mas util y una experiencia publica mucho mas aspiracional."
            />
            <div className="public-bullet-list">
              <div>
                <FontAwesomeIcon icon={faLeaf} />
                <span>Selecciones por atmosfera, luz y mantenimiento.</span>
              </div>
              <div>
                <FontAwesomeIcon icon={faShieldHeart} />
                <span>Mas confianza con contenido, guias y estructura editorial.</span>
              </div>
              <div>
                <FontAwesomeIcon icon={faStar} />
                <span>Una identidad visual con mas personalidad y mejor venta.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default About;
