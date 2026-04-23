import React from "react";
import PublicPageLayout from "./PublicPageLayout";
import SectionHeading from "./SectionHeading";
import { remoteImages } from "./siteContent";
import "../css/PublicSite.css";

const giftingUses = [
  "Regalos personales con mensaje y seleccion visual.",
  "Detalles corporativos para eventos y equipos.",
  "Bundles botanicos para fechas especiales y lanzamientos.",
];

const GiftingView = () => (
  <PublicPageLayout searchPlaceholder="Busca regalos, detalles o experiencias botanicas">
    <section className="public-page-hero">
      <div className="public-shell public-page-hero__grid">
        <div>
          <span className="public-page-hero__eyebrow">Regalos botanicos</span>
          <h1 className="public-page-hero__title">Una pagina pensada para vender emocion, no solo producto.</h1>
          <p className="public-page-hero__copy">
            Aqui Plantopia puede hablar de regalo, sorpresa, empaque y experiencia.
            Eso abre otra forma de vender distinta al catalogo tradicional.
          </p>
        </div>
        <div className="public-page-hero__visual">
          <img src={remoteImages.collectionGift} alt="Regalos botanicos de Plantopia" />
        </div>
      </div>
    </section>

    <section className="public-section">
      <div className="public-shell">
        <SectionHeading
          eyebrow="Usos"
          title="Donde esta pagina ayuda a convertir mejor"
          copy="Regalos, eventos y experiencias botanicas suelen comprar por contexto emocional."
        />
        <div className="public-editorial-grid">
          {giftingUses.map((item, index) => (
            <article key={item} className="public-editorial-card">
              <span className="public-editorial-card__index">0{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  </PublicPageLayout>
);

export default GiftingView;
