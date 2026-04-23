import React from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faHeart,
  faLock,
  faSeedling,
  faUser,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "./footer";
import PublicHeader from "../shared/PublicHeader";
import "../css/AlertaSesion.css";
import "../css/HomePage.css";
import { getSessionData, isAuthenticated } from "../../utils/session";

const AlertaSesion = () => {
  const sessionData = getSessionData();
  const isUserLoggedIn = isAuthenticated(sessionData);

  if (!isUserLoggedIn) {
    return (
      <div className="plantopia-layout">
        <PublicHeader />

        <main className="plantopia-main">
          <Container>
            <Alert variant="light" className="border-0 shadow-lg my-4 plantopia-alert">
              <Row className="align-items-center">
                <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
                  <FontAwesomeIcon icon={faSeedling} size="4x" className="text-success animated-icon" />
                </Col>
                <Col xs={12} md={7}>
                  <Alert.Heading className="text-success mb-2 d-flex align-items-center">
                    <FontAwesomeIcon icon={faExclamationCircle} className="me-2 pulse-icon" />
                    <span>Necesitas iniciar sesion primero</span>
                  </Alert.Heading>
                  <p className="mb-2 text-muted">
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    Para proteger el panel y las compras, este contenido de Plantopia
                    esta reservado para usuarios con sesion activa.
                  </p>
                  <p className="mb-0 text-success">
                    <FontAwesomeIcon icon={faSeedling} className="me-2" />
                    Inicia sesion y continua tu experiencia sin fricciones.
                  </p>
                </Col>
                <Col xs={12} md={3} className="text-center mt-3 mt-md-0">
                  <Link to="/auth/login" className="d-block mb-2">
                    <Button variant="outline-success" size="lg" className="rounded-pill btn-animated w-100">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Iniciar sesion
                    </Button>
                  </Link>
                  <Link to="/auth/register" className="d-block">
                    <Button variant="outline-success" size="lg" className="rounded-pill btn-animated w-100">
                      <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                      Crear cuenta
                    </Button>
                  </Link>
                </Col>
              </Row>
              <hr className="my-4" />
              <p className="text-center mb-0 love-plants">
                <FontAwesomeIcon icon={faHeart} className="text-danger me-2 beat-icon" />
                Unete a nuestra comunidad de amantes de las plantas
                <FontAwesomeIcon icon={faHeart} className="text-danger ms-2 beat-icon" />
              </p>
            </Alert>
          </Container>
        </main>

        <Footer />
      </div>
    );
  }

  return null;
};

export default AlertaSesion;
