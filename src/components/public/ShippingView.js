import React from "react";
import PublicPageLayout from "./PublicPageLayout";
import { remoteImages } from "./siteContent";
import "../css/PublicSite.css";

const shippingSteps = [
  "Seleccion y empaque con foco en presentacion y proteccion.",
  "Salida a ruta con piezas estables y protegidas segun volumen.",
  "Entrega final con instrucciones basicas para abrir, ubicar y regar.",
];

const ShippingView = () => (
  <PublicPageLayout searchPlaceholder="Busca entregas, rutas o compras por volumen">
    <section className="public-page-hero">
      <div className="public-shell public-page-hero__grid">
        <div>
          <span className="public-page-hero__eyebrow">Envios y experiencia</span>
          <h1 className="public-page-hero__title">La entrega tambien forma parte de la marca.</h1>
          <p className="public-page-hero__copy">
            Una pagina como esta da confianza: explica proceso, reduce dudas y
            hace que comprar en linea una planta no se sienta riesgoso.
          </p>
        </div>
        <div className="public-page-hero__visual">
          <img src={remoteImages.delivery} alt="Empaque y entrega de Plantopia" />
        </div>
      </div>
    </section>

    <section className="public-section">
      <div className="public-shell public-service-grid">
        {shippingSteps.map((step, index) => (
          <article key={step} className="public-service-card">
            <span className="public-editorial-card__index">0{index + 1}</span>
            <p>{step}</p>
          </article>
        ))}
      </div>
    </section>
  </PublicPageLayout>
);

export default ShippingView;
