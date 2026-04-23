import React from "react";
import PublicPageLayout from "./PublicPageLayout";
import SectionHeading from "./SectionHeading";
import { remoteImages } from "./siteContent";
import "../css/PublicSite.css";

const tips = [
  "Elige por luz disponible antes de elegir por moda.",
  "Empieza con especies de bajo mantenimiento si es tu primera compra.",
  "Evita macetas sin drenaje si no tienes experiencia con riego.",
  "Una planta bonita vende mas cuando llega con una guia clara.",
];

const CareGuideView = () => (
  <PublicPageLayout searchPlaceholder="Busca guias de luz, riego o mantenimiento">
    <section className="public-page-hero">
      <div className="public-shell public-page-hero__grid">
        <div>
          <span className="public-page-hero__eyebrow">Guia de cuidados</span>
          <h1 className="public-page-hero__title">Antes de comprar, ayudale al usuario a elegir mejor.</h1>
          <p className="public-page-hero__copy">
            Esta pagina da contexto. Reduce friccion, baja dudas y hace que el
            catalogo se sienta mas confiable para personas que apenas empiezan.
          </p>
        </div>
        <div className="public-page-hero__visual">
          <img src={remoteImages.careGuide} alt="Persona cuidando plantas en interior" />
        </div>
      </div>
    </section>

    <section className="public-section">
      <div className="public-shell">
        <SectionHeading
          eyebrow="Checklist rapido"
          title="Consejos simples que empujan la compra correcta"
          copy="No todo tiene que ser articulo largo; a veces una guia corta y clara resuelve mas."
        />
        <div className="public-editorial-grid">
          {tips.map((tip, index) => (
            <article key={tip} className="public-editorial-card">
              <span className="public-editorial-card__index">0{index + 1}</span>
              <p>{tip}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  </PublicPageLayout>
);

export default CareGuideView;
