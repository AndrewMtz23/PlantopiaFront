import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faLeaf,
  faLocationDot,
  faShieldHalved,
  faShoppingCart,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import "../css/Catalogo.css";
import RequireAuth from "../shared/RequireAuth";
import PublicHeader from "../shared/PublicHeader";
import Footer from "../decoraciones/footer";
import ProductImage from "../shared/ProductImage";
import { getProductImageCandidates } from "../../utils/productImages";
import { getSessionData } from "../../utils/session";
import { addProductToCart } from "../../services/cartService";
import { addToWishlist, getWishlistIds, removeInventoryFromWishlist } from "../../services/wishlistService";

const ProductDetailView = () => {
  const { inventarioId } = useParams();
  const sessionData = getSessionData();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Axios.get(`/productoDetalle/${inventarioId}`)
      .then((response) => {
        setProduct(response.data);
        setError("");
      })
      .catch((fetchError) => {
        console.error(fetchError);
        setError(fetchError?.response?.data?.error || "No se pudo cargar el producto.");
      })
      .finally(() => setLoading(false));
  }, [inventarioId]);

  const gallery = useMemo(() => getProductImageCandidates(product || {}), [product]);

  useEffect(() => {
    setActiveImage(gallery[0] || "");
  }, [gallery]);

  useEffect(() => {
    if (!sessionData?.idUsuario || !product?.id) {
      return;
    }

    getWishlistIds(sessionData.idUsuario)
      .then((ids) => setIsInWishlist(ids.includes(product.id)))
      .catch((wishlistError) => console.error(wishlistError));
  }, [product?.id, sessionData?.idUsuario]);

  const handleAddToCart = async () => {
    try {
      await addProductToCart({
        product,
        quantity: Number(quantity),
        userId: sessionData.idUsuario,
      });

      Swal.fire("Agregado", "El producto se agrego al carrito.", "success");
    } catch (cartError) {
      Swal.fire("Error", cartError.message || "No se pudo agregar al carrito.", "error");
    }
  };

  const handleWishlist = async () => {
    try {
      if (isInWishlist) {
        await removeInventoryFromWishlist({
          productId: product.id,
          userId: sessionData.idUsuario,
        });
        setIsInWishlist(false);
        return;
      }

      await addToWishlist({
        productId: product.id,
        userId: sessionData.idUsuario,
      });
      setIsInWishlist(true);
    } catch (wishlistError) {
      Swal.fire("Error", "No se pudo actualizar favoritos.", "error");
    }
  };

  return (
    <RequireAuth>
      <div className="b2b-store-page product-detail-page">
        <PublicHeader />

        <main className="product-detail-shell">
          <Link to="/catalogo" className="product-detail-back">
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver al catalogo
          </Link>

          {loading ? (
            <section className="product-detail-empty">Cargando producto...</section>
          ) : error ? (
            <section className="product-detail-empty">{error}</section>
          ) : product ? (
            <>
              <section className="product-detail-hero">
                <div className="product-detail-gallery">
                  <div className="product-detail-main-image">
                    <ProductImage product={{ ...product, imagen: activeImage }} alt={product.nombre} />
                  </div>

                  <div className="product-detail-thumbs">
                    {gallery.map((image) => (
                      <button
                        key={image}
                        type="button"
                        className={image === activeImage ? "active" : ""}
                        onClick={() => setActiveImage(image)}
                      >
                        <ProductImage product={{ imagen: image }} alt={product.nombre} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="product-detail-info">
                  <span className="product-detail-eyebrow">
                    <FontAwesomeIcon icon={faLeaf} />
                    {product.categoria}
                  </span>
                  <h1>{product.nombre}</h1>
                  <p>{product.detalles}</p>

                  <div className="product-detail-price">
                    ${Number(product.precioVenta || 0).toFixed(2)}
                    <small>MXN</small>
                  </div>

                  <div className="product-detail-actions">
                    <label>
                      <span>Cantidad</span>
                      <input
                        type="number"
                        min="1"
                        max={product.cantidad}
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                      />
                    </label>
                    <button className="b2b-btn" onClick={handleAddToCart}>
                      <FontAwesomeIcon icon={faShoppingCart} />
                      Agregar al carrito
                    </button>
                    <button
                      className={`product-detail-wishlist ${isInWishlist ? "active" : ""}`}
                      onClick={handleWishlist}
                      aria-label={isInWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                  </div>

                  <div className="product-detail-trust">
                    <span>
                      <FontAwesomeIcon icon={faTruckFast} />
                      Entrega disponible
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faShieldHalved} />
                      Compra protegida
                    </span>
                  </div>
                </div>
              </section>

              <section className="product-detail-grid">
                <article>
                  <h2>Detalles</h2>
                  <p>{product.detalles}</p>
                </article>
                <article>
                  <h2>Disponibilidad</h2>
                  <div className="product-detail-availability">
                    {product.disponibilidad?.map((item) => (
                      <div key={item.id}>
                        <span>
                          <FontAwesomeIcon icon={faLocationDot} />
                          {item.sucursal_nombre}
                        </span>
                        <strong>{item.cantidad} disponibles</strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </>
          ) : null}
        </main>

        <Footer />
      </div>
    </RequireAuth>
  );
};

export default ProductDetailView;
