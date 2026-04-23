import React from "react";

const SectionHeading = ({ eyebrow, title, copy, centered = false }) => (
  <div className={`public-section-heading ${centered ? "public-section-heading--center" : ""}`}>
    {eyebrow ? <span className="public-section-heading__eyebrow">{eyebrow}</span> : null}
    <h2 className="public-section-heading__title">{title}</h2>
    {copy ? <p className="public-section-heading__copy">{copy}</p> : null}
  </div>
);

export default SectionHeading;
