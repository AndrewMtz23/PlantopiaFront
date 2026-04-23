import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import SectionHeading from "../SectionHeading";
import { homeCollections } from "../siteContent";

const HomeCollectionsSection = () => (
  <section className="public-section">
    <div className="public-shell">
      <SectionHeading
        eyebrow="Curaduria"
        title="Colecciones que se sienten listas para comprar"
        copy="No todo mundo compra por especie. Mucha gente compra por ambiente, por dificultad o por la sensacion que quiere lograr."
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
              <strong>
                Ver mas <FontAwesomeIcon icon={faArrowRight} />
              </strong>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default HomeCollectionsSection;
