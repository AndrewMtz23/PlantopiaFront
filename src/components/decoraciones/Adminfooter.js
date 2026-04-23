import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import logo from "../logos.png";
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../css/Footer.css'; // Asegúrate de que la ruta al archivo CSS sea correcta

const AFooter = () => {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-content">
          <div className="footer-section">
            <h3><FontAwesomeIcon icon={faLeaf} /> Plantopia</h3>
            <p>Tu tienda de confianza para todas tus necesidades de plantas.</p>
            <img src={logo} alt="Logo" style={{ height: "50px" }} />
          </div>
          <div className="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul className="list-unstyled">
              <li><Link to="/usuarios">Usuarios</Link></li>
              <li><Link to="/sucursales">Sucursales</Link></li>
              <li><Link to="/proveedores">Proveedores</Link></li>
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/inventarios">Inventarios</Link></li>
              <li><Link to="/graficas">Gráficas</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <p><FontAwesomeIcon icon={faEnvelope} /> info@plantopia.com</p>
            <p><FontAwesomeIcon icon={faPhone} /> (123) 456-7890</p>
            <p><FontAwesomeIcon icon={faMapMarkerAlt} /> Calle Principal 123, Ciudad de México</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="mb-0">&copy; 2024 Plantopia. Todos los derechos reservados.</p>
        </div>
      </Container>
    </footer>
  );
};

export default AFooter;
