import React from "react";
import { Link } from "react-router-dom";
import PublicPageLayout from "./PublicPageLayout";
import SectionHeading from "./SectionHeading";
import { homeCollections, remoteImages } from "./siteContent";
import "../css/PublicSite.css";

const CollectionsView = () => (
  <PublicPageLayout searchPlaceholder="Busca interior, regalo, suculentas o envios">
    <section className="public-page-hero">
      <div className="public-shell public-page-hero__grid">
        <div>
          <span className="public-page-hero__eyebrow">Colecciones</span>
          <h1 className="public-page-hero__title">Comprar por ambiente es mas intuitivo que comprar por SKU.</h1>
          <p className="public-page-hero__copy">
            Reunimos selecciones por estilo para que una persona nueva se enamore
            del sitio antes de abrir el catalogo tecnico.
          </p>
        </div>
        <div className="public-page-hero__visual">
          <img src={remoteImages.collectionIndoor} alt="Coleccion de interior Plantopia" />
        </div>
      </div>
    </section>

    <section className="public-section">
      <div className="public-shell">
        <SectionHeading
          eyebrow="Curaduria de venta"
          title="Tres rutas claras para entrar a Plantopia"
          copy="Esto convierte mucho mejor que mandar a todo mundo directo a una parrilla de productos."
        />
        <div className="public-collection-grid">
          {homeCollections.map((collection) => (
            <Link key={collection.title} to={collection.to} className="public-collection-card">
              <img src={collection.image} alt={collection.title} />
              <div className="public-collection-card__overlay" />
              <div className="public-collection-card__content">
                <span>{collection.tag}</span>
                <h3>{collection.title}</h3>
                <p>{collection.copy}</p>
                <strong>Explorar</strong>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </PublicPageLayout>
);

export default CollectionsView;
