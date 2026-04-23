import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faTruck,
  faComments,
  faMinus,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { Row, Button, Col, Container, Alert, Card } from "react-bootstrap";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../css/Catalogo.css";
import Swal from "sweetalert2";
import Footer from "../decoraciones/footer";
import { getSessionData } from "../../utils/session";
import { getWishlist, removeFromWishlist } from "../../services/wishlistService";
import RequireAuth from "../shared/RequireAuth";
import PublicHeader from "../shared/PublicHeader";
import StoreHero from "./StoreHero";
import ProductDisplayCard from "./ProductDisplayCard";

const WishlistProductCard = ({ producto, onEliminar }) => {
  return (
    <ProductDisplayCard producto={producto}>
      <Button
        variant="danger"
        onClick={() => onEliminar(producto.id)}
        className="w-100"
      >
        <FontAwesomeIcon icon={faMinus} className="mr-2" />
        Eliminar de la Lista
      </Button>
    </ProductDisplayCard>
  );
};

const serviceCards = [
  {
    icon: faTruck,
    title: "Envios a Domicilio",
    text: "Entregamos tus plantas favoritas directamente a tu puerta en todo Mexico.",
  },
  {
    icon: faBoxes,
    title: "Ventas al por Mayor",
    text: "Ofrecemos descuentos especiales para compras en grandes cantidades.",
  },
  {
    icon: faComments,
    title: "Asesoramiento Experto",
    text: "Nuestro equipo de expertos te ayudara a elegir y cuidar tus plantas.",
  },
];

const WishlistView = () => {
  const [lista, setLista] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [listaCompleta, setListaCompleta] = useState([]);
  const sessionData = getSessionData();

  const images = [
    "hojas-pequenas.webp",
    "hojas.webp",
    "plantas-endemicas.webp",
    "flores-pixels.webp",
  ];

  useEffect(() => {
    if (!sessionData?.idUsuario) {
      return;
    }

    getWishlist(sessionData.idUsuario)
      .then((wishlist) => {
        const uniqueProducts = Array.from(new Set(wishlist.map((product) => product.inventario_id)))
          .map((id) => wishlist.find((product) => product.inventario_id === id));
        setLista(uniqueProducts);
        setListaCompleta(uniqueProducts);
      })
      .catch((error) => {
        console.error("Error al obtener la lista de deseos:", error);
      });
  }, [sessionData?.idUsuario]);

  const handleEliminarClick = (id) => {
    removeFromWishlist(id)
      .then(() => {
        setLista((prevLista) => prevLista.filter((producto) => producto.id !== id));
        setListaCompleta((prevLista) => prevLista.filter((producto) => producto.id !== id));
        Swal.fire({
          icon: "success",
          title: "Eliminado!",
          text: "El producto ha sido eliminado de tu lista de deseos.",
        });
      })
      .catch((error) => {
        console.error("Error al eliminar de la lista de deseos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el producto. Por favor, intenta de nuevo.",
        });
      });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const filteredList = listaCompleta.filter((producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.detalles.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setLista(filteredList);
  };

  return (
    <RequireAuth>
      <div className="b2b-store-page wishlist-page">
        <PublicHeader
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchSubmit={handleSearch}
        />

        <main className="wishlist-page__main">
          <StoreHero
            images={images}
            title="Lista de Deseos"
            description="Explora los productos que has guardado para comprar mas tarde"
            icon={faHeart}
          />

          <Container className="wishlist-page__shell">
            {lista.length === 0 ? (
              <Alert variant="info" className="wishlist-page__empty">
                No hay productos en la lista de deseos.
              </Alert>
            ) : (
              <Row className="g-4">
                {lista.map((producto) => (
                  <Col md={6} lg={4} key={producto.inventario_id}>
                    <WishlistProductCard producto={producto} onEliminar={handleEliminarClick} />
                  </Col>
                ))}
              </Row>
            )}
          </Container>

          <section className="wishlist-services">
            <Container className="wishlist-page__shell">
              <h2 className="wishlist-services__title">
                <FontAwesomeIcon icon={faBoxes} /> Nuestros Servicios
              </h2>
              <Row className="g-4">
              {serviceCards.map((service) => (
                <Col md={4} key={service.title}>
                  <Card className="wishlist-service-card h-100">
                    <Card.Body className="text-center">
                      <FontAwesomeIcon icon={service.icon} className="wishlist-service-card__icon mb-3" size="3x" />
                      <Card.Title>{service.title}</Card.Title>
                      <Card.Text>{service.text}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              </Row>
            </Container>
          </section>
        </main>

        <Footer />
      </div>
    </RequireAuth>
  );
};

export default WishlistView;
