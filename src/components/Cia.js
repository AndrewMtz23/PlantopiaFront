import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBoxesStacked, faBuilding, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import PublicPageLayout from "./public/PublicPageLayout";
import SectionHeading from "./public/SectionHeading";
import { companyCapabilities, remoteImages } from "./public/siteContent";
import "./css/PublicSite.css";

const Company = () => {
  return (
    <PublicPageLayout searchPlaceholder="Busca envios, oficina, volumen o cuidados">
      <section className="public-page-hero">
        <div className="public-shell public-page-hero__grid">
          <div>
            <span className="public-page-hero__eyebrow">Cia / Estudio comercial</span>
            <h1 className="public-page-hero__title">Detras de Plantopia hay una operacion que si puede crecer.</h1>
            <p className="public-page-hero__copy">
              Esta pagina ya no se siente como carrusel escolar: ahora presenta
              a Plantopia como un estudio comercial listo para retail botanico,
              regalos y compras por volumen.
            </p>
            <div className="public-inline-actions">
              <Link to="/envios" className="public-button public-button--primary">
                Ver entregas
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/regalos-botanicos" className="public-button public-button--ghost">
                Regalos y eventos
              </Link>
            </div>
          </div>
          <div className="public-page-hero__visual">
            <img src={remoteImages.delivery} alt="Operacion de empaque y entrega" />
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-shell">
          <SectionHeading
            eyebrow="Capacidades"
            title="Que puede comunicar Plantopia hoy sin quedarse corto"
            copy="Retail botanico, experiencia consultiva y posibilidad de escalar a regalos o compras empresariales."
          />
          <div className="public-editorial-grid">
            {companyCapabilities.map((capability) => (
              <article key={capability.title} className="public-editorial-card">
                <h3>{capability.title}</h3>
                <p>{capability.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section--muted">
        <div className="public-shell public-service-grid">
          <article className="public-service-card">
            <FontAwesomeIcon icon={faTruckFast} />
            <h3>Entregas cuidadas</h3>
            <p>Proceso de envio pensado para proteger presentacion, maceta y empaque.</p>
          </article>
          <article className="public-service-card">
            <FontAwesomeIcon icon={faBoxesStacked} />
            <h3>Pedidos por volumen</h3>
            <p>Rutas mas claras para oficinas, eventos y clientes recurrentes.</p>
          </article>
          <article className="public-service-card">
            <FontAwesomeIcon icon={faBuilding} />
            <h3>Ambientacion comercial</h3>
            <p>Espacio para crecer a asesorias visuales y paquetes curados por tipo de sitio.</p>
          </article>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Company;
