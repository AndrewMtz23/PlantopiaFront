import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faLeaf,
  faSearch,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { Alert, Container, Spinner } from "react-bootstrap";
import "../css/Catalogo.css";
import Footer from "../decoraciones/footer";
import { getSessionData } from "../../utils/session";
import { getWishlist } from "../../services/wishlistService";
import RequireAuth from "../shared/RequireAuth";
import PublicHeader from "../shared/PublicHeader";
import CatalogProductCard from "./CatalogProductCard";

const WishlistView = () => {
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const sessionData = getSessionData();

  useEffect(() => {
    let cancelled = false;

    if (!sessionData?.idUsuario) {
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    getWishlist(sessionData.idUsuario)
      .then((items) => {
        if (!cancelled) {
          setWishlist(Array.isArray(items) ? items : []);
          setError("");
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          console.error("Error al obtener favoritos:", fetchError);
          setError("No se pudieron cargar tus favoritos.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionData?.idUsuario]);

  const filteredWishlist = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return wishlist;
    }

    return wishlist.filter((product) =>
      [product.nombre, product.detalles, product.categoria]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [wishlist, searchTerm]);

  const stats = useMemo(() => {
    const totalValue = filteredWishlist.reduce(
      (sum, product) => sum + Number(product.precioVenta || 0),
      0
    );
    const availableProducts = filteredWishlist.filter(
      (product) => Number(product.cantidad || 0) > 0
    ).length;

    return {
      total: filteredWishlist.length,
      availableProducts,
      totalValue,
    };
  }, [filteredWishlist]);

  const handleSearch = (event) => {
    event.preventDefault();
  };

  return (
    <RequireAuth>
      <div className="b2b-store-page wishlist-page">
        <PublicHeader
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchSubmit={handleSearch}
          searchPlaceholder="Buscar en favoritos..."
        />

        <main className="wishlist-page__main">
          <section className="wishlist-hero">
            <Container className="wishlist-page__shell wishlist-hero__grid">
              <div>
                <span className="wishlist-hero__eyebrow">
                  <FontAwesomeIcon icon={faHeart} />
                  Favoritos Plantopia
                </span>
                <h1>Tu lista para comprar despues</h1>
                <p>
                  Guarda piezas, compara opciones y manda al carrito cuando ya tengas claro
                  que va mejor con tu espacio.
                </p>
                <div className="wishlist-hero__actions">
                  <Link to="/catalogo" className="b2b-btn wishlist-hero__button">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Volver al catalogo
                  </Link>
                </div>
              </div>

              <aside className="wishlist-summary">
                <div>
                  <span>Favoritos</span>
                  <strong>{stats.total}</strong>
                </div>
                <div>
                  <span>Disponibles</span>
                  <strong>{stats.availableProducts}</strong>
                </div>
                <div>
                  <span>Valor visible</span>
                  <strong>
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(stats.totalValue)}
                  </strong>
                </div>
              </aside>
            </Container>
          </section>

          <Container className="wishlist-page__shell">
            <div className="wishlist-toolbar">
              <label className="wishlist-search">
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nombre, categoria o detalle"
                />
              </label>
              <Link to="/carrito" className="wishlist-cart-link">
                <FontAwesomeIcon icon={faShoppingCart} />
                Ver carrito
              </Link>
            </div>

            {isLoading ? (
              <div className="wishlist-page__empty wishlist-page__empty--center">
                <Spinner animation="border" />
                <span>Cargando favoritos...</span>
              </div>
            ) : error ? (
              <Alert variant="danger" className="wishlist-page__empty">
                {error}
              </Alert>
            ) : filteredWishlist.length === 0 ? (
              <div className="wishlist-page__empty wishlist-page__empty--center">
                <FontAwesomeIcon icon={faLeaf} />
                <strong>No hay favoritos para mostrar</strong>
                <p>Explora el catalogo y toca el corazon de los productos que quieras guardar.</p>
                <Link to="/catalogo" className="b2b-btn wishlist-hero__button">
                  Ir al catalogo
                </Link>
              </div>
            ) : (
              <div className="b2b-products-grid wishlist-products-grid">
                {filteredWishlist.map((product) => (
                  <CatalogProductCard producto={product} key={product.inventario_id || product.id} />
                ))}
              </div>
            )}
          </Container>
        </main>

        <Footer />
      </div>
    </RequireAuth>
  );
};

export default WishlistView;
