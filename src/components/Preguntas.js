import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import PublicPageLayout from "./public/PublicPageLayout";
import SectionHeading from "./public/SectionHeading";
import { faqItems } from "./public/siteContent";
import "./css/PublicSite.css";

const FAQ = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    question: "",
  });

  const activeItem = useMemo(() => faqItems[selectedQuestion], [selectedQuestion]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.question) {
      Swal.fire({
        icon: "error",
        title: "Faltan datos",
        text: "Completa tu nombre, correo y pregunta para enviarla.",
        confirmButtonColor: "#1b4d3e",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Pregunta enviada",
      text: "Gracias por escribirnos. Esta parte puede conectarse luego a backend o correo.",
      confirmButtonColor: "#1b4d3e",
    });

    setForm({ name: "", email: "", question: "" });
  };

  return (
    <PublicPageLayout searchPlaceholder="Busca dudas sobre envios, cuidados o regalos">
      <section className="public-page-hero public-page-hero--compact">
        <div className="public-shell">
          <span className="public-page-hero__eyebrow">Preguntas frecuentes</span>
          <h1 className="public-page-hero__title">Resuelve dudas sin romper el mood del sitio.</h1>
          <p className="public-page-hero__copy">
            Esta pagina ahora funciona mejor como centro de confianza: menos FAQ plana y mas espacio para explicar como compra una persona nueva.
          </p>
        </div>
      </section>

      <section className="public-section">
        <div className="public-shell public-faq-layout">
          <div className="public-faq-list">
            {faqItems.map((faq, index) => (
              <button
                key={faq.question}
                type="button"
                className={`public-faq-item ${selectedQuestion === index ? "public-faq-item--active" : ""}`}
                onClick={() => setSelectedQuestion(index)}
              >
                <strong>{faq.question}</strong>
                <span>{selectedQuestion === index ? "Abierto" : "Ver respuesta"}</span>
              </button>
            ))}
          </div>

          <div className="public-faq-answer-card">
            <SectionHeading
              eyebrow="Respuesta destacada"
              title={activeItem.question}
              copy={activeItem.answer}
            />
          </div>
        </div>
      </section>

      <section className="public-section public-section--muted">
        <div className="public-shell public-contact-card">
          <div>
            <SectionHeading
              eyebrow="Contacto"
              title="Si la duda no esta aqui, deja una pregunta"
              copy="Dejamos la interfaz lista para conectar despues un correo, formulario real o ticket de soporte."
            />
          </div>

          <form className="public-form-grid" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nombre"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              type="email"
              placeholder="Correo"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <textarea
              placeholder="Escribe tu pregunta"
              rows="5"
              value={form.question}
              onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))}
            />
            <button type="submit" className="public-button public-button--primary">
              Enviar pregunta
            </button>
          </form>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default FAQ;
