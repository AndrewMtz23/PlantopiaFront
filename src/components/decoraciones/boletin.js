import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import '../css/HomePage.css'

const Boletin = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === '') {
      // Mostrar alerta si no se ingresa un correo
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa un correo electrónico válido.',
      });
    } else {
      // Mostrar alerta de éxito

        Swal.fire({
          title: '¡Perfecto!',
          text: 'Recibirás notificaciones y ofertas especiales en tu correo.',
          icon: 'success',
          confirmButtonText: 'Genial',
          confirmButtonColor: '#4CAF50',
          backdrop: true,
          background: '#f0f0f0',
          customClass: {
            popup: 'animated fadeInDown faster',
          },
        });
      
      // Limpiar el campo de correo
      setEmail('');
    }
  };

  return (
    <section className="newsletter-section">
        <div className="container">
            <h2><FontAwesomeIcon icon={faEnvelope} /> Suscríbete a nuestro boletín </h2>
            <p>Recibe las últimas novedades y ofertas especiales directamente en tu correo.</p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
            
            <input
            type="email"
            id="email"
            name="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
            <button type="submit">Suscribirse <FontAwesomeIcon icon={faPaperPlane} /></button>
            </form>
        </div>
    </section>
  );
};

export default Boletin;
