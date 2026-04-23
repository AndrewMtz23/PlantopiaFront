import React from "react";
import SectionHeading from "../SectionHeading";
import { testimonials } from "../siteContent";

const HomeTestimonialsSection = () => (
  <section className="public-section public-section--muted">
    <div className="public-shell">
      <SectionHeading
        eyebrow="Prueba social"
        title="La experiencia tiene que vender tan bien como el producto"
        copy="Queremos que Plantopia se sienta como una boutique botanica moderna: confiable, bonita y facil de recorrer."
      />

      <div className="public-testimonial-grid">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name} className="public-testimonial-card">
            <p>"{testimonial.quote}"</p>
            <strong>{testimonial.name}</strong>
            <span>{testimonial.role}</span>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default HomeTestimonialsSection;
