import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCompassDrafting,
  faLeaf,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import PublicPageLayout from "./public/PublicPageLayout";
import HomeHeroSection from "./public/home/HomeHeroSection";
import HomeHighlightsSection from "./public/home/HomeHighlightsSection";
import HomeCollectionsSection from "./public/home/HomeCollectionsSection";
import HomeTestimonialsSection from "./public/home/HomeTestimonialsSection";
import SectionHeading from "./public/SectionHeading";
import CatalogProductCard from "./shop/CatalogProductCard";
import { getSessionData, isAdminSession, isAuthenticated } from "../utils/session";
import { remoteImages } from "./public/siteContent";
import "./css/PublicSite.css";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const sessionData = getSessionData();
  const isLoggedIn = isAuthenticated(sessionData);
  const isAdmin = isAdminSession(sessionData);

  useEffect(() => {
    Axios.get("/obtenerProductos")
      .then((response) => {
        setFeaturedProducts((response.data || []).slice(0, 4));
      })
      .catch((error) => {
        console.error("Error al obtener los productos:", error);
      });
  }, []);

  const featuredCards = useMemo(
    () =>
      featuredProducts.map((product) => ({
        ...product,
        imagen: product.imagen || "",
        imagenUrl: product.imagenUrl || product.imageUrl || remoteImages.collectionIndoor,
      })),
    [featuredProducts]
  );

  return (
    <PublicPageLayout searchPlaceholder="Busca por estilo, espacio o cuidado">
      <HomeHeroSection isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      <HomeHighlightsSection />
      <HomeCollectionsSection />

      <section className="public-section">
        <div className="public-shell">
          <SectionHeading
            eyebrow="Drop semanal"
            title="Piezas destacadas para comprar con ganas"
            copy="Trajimos el producto al frente con mejor presencia, mejor aire y menos sensacion de tarjeta vieja improvisada."
            centered
          />

          <div className="public-product-grid">
            {featuredCards.map((product) => (
              <CatalogProductCard key={product.id} producto={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section--split">
        <div className="public-shell public-split-grid">
          <div className="public-split-copy">
            <SectionHeading
              eyebrow="Experiencia"
              title="Una tienda que deberia hacerte querer comprar, no solo ver productos"
              copy="Subimos el nivel visual del home para que parezca una marca viva: mas narrativa, mas aspiracion y mejores rutas para descubrir."
            />
            <div className="public-bullet-list">
              <div>
                <FontAwesomeIcon icon={faStar} />
                <span>Curaduria por estilo, no solo por categoria.</span>
              </div>
              <div>
                <FontAwesomeIcon icon={faCompassDrafting} />
                <span>Paginas estaticas para colecciones, envios, guias y regalos.</span>
              </div>
              <div>
                <FontAwesomeIcon icon={faLeaf} />
                <span>Un tono mas premium para que todo empuje a comprar.</span>
              </div>
            </div>

            <div className="public-inline-actions">
              <Link to="/cuidados" className="public-button public-button--ghost">
                Ver guia de cuidados
              </Link>
              <Link to="/envios" className="public-button public-button--ghost">
                Revisar entregas
              </Link>
            </div>
          </div>

          <div className="public-story-card">
            <img src={remoteImages.lifestyle} alt="Interior con plantas decorativas" />
            <div className="public-story-card__content">
              <span>Plantopia living</span>
              <strong>Disenado para hogar, estudio y regalos con presencia.</strong>
            </div>
          </div>
        </div>
      </section>

      <HomeTestimonialsSection />

      <section className="public-section">
        <div className="public-shell">
          <div className="public-cta-banner">
            <div>
              <span>Descubrir mas</span>
              <h3>Abre rutas nuevas dentro del sitio y lleva mejor al usuario.</h3>
              <p>
                Ya no todo tiene que vivir en el catalogo. Ahora hay paginas que
                venden por contexto, aspiracion y confianza.
              </p>
            </div>
            <div className="public-cta-banner__actions">
              <Link to="/colecciones" className="public-button public-button--primary">
                Ver colecciones
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/regalos-botanicos" className="public-button public-button--ghost">
                Regalos botanicos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default HomePage;
