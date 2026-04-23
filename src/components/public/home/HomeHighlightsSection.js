import React from "react";
import { trustHighlights } from "../siteContent";

const HomeHighlightsSection = () => (
  <section className="public-highlights">
    <div className="public-shell public-highlights__grid">
      {trustHighlights.map((item) => (
        <article key={item.label} className="public-highlight-card">
          <strong>{item.value}</strong>
          <h3>{item.label}</h3>
          <p>{item.copy}</p>
        </article>
      ))}
    </div>
  </section>
);

export default HomeHighlightsSection;
