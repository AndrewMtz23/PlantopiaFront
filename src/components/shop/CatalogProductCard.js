import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faHeart,
  faMinus,
  faPlus,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import "../css/Catalogo.css";
import ProductImage from "../shared/ProductImage";
import { getSessionData } from "../../utils/session";
import { addProductToCart } from "../../services/cartService";
import { addToWishlist, getWishlistIds, removeInventoryFromWishlist } from "../../services/wishlistService";

const CatalogProductCard = ({ producto }) => {
  const [cantidad, setCantidad] = useState(1);
  const [isEnLista, setIsEnLista] = useState(false);
  const [isAgregadoAlCarrito, setIsAgregadoAlCarrito] = useState(false);
  const sessionData = getSessionData();
  const navigate = useNavigate();

  const requireSession = () => {
    if (sessionData?.idUsuario) {
      return true;
    }

    Swal.fire({
      title: "Inicia sesion",
      text: "Entra para guardar favoritos y agregar productos al carrito.",
      icon: "info",
      confirmButtonText: "Ir a login",
      confirmButtonColor: "#1b4d3e",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/auth/login");
      }
    });

    return false;
  };

  useEffect(() => {
    if (!sessionData?.idUsuario) {
      return;
    }

    getWishlistIds(sessionData.idUsuario)
      .then((wishlistIds) => {
        setIsEnLista(wishlistIds.includes(producto.id));
      })
      .catch((error) => {
        console.error("Error al obtener productos en lista:", error);
      });
  }, [producto.id, sessionData?.idUsuario]);

  useEffect(() => {
    setIsAgregadoAlCarrito(false);
  }, [cantidad, producto.id]);

  const handleCantidadChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= producto.cantidad) {
      setCantidad(value);
    }
  };

  const decreaseQuantity = () => {
    setCantidad((current) => Math.max(1, Number(current) - 1));
  };

  const increaseQuantity = () => {
    setCantidad((current) => Math.min(Number(producto.cantidad), Number(current) + 1));
  };

  const handleWishlistClick = async () => {
    if (!requireSession()) {
      return;
    }

    try {
      if (isEnLista) {
        await removeInventoryFromWishlist({
          productId: producto.id,
          userId: sessionData.idUsuario,
        });
        setIsEnLista(false);
        return;
      }

      await addToWishlist({
        productId: producto.id,
        userId: sessionData.idUsuario,
      });
      setIsEnLista(true);
    } catch (error) {
      console.error("Error al actualizar la lista:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!requireSession()) {
      return;
    }

    const quantity = parseInt(cantidad, 10);

    if (isNaN(quantity) || quantity <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La cantidad ingresada no es valida.",
      });
      return;
    }

    if (quantity > producto.cantidad) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La cantidad ingresada supera la cantidad disponible del producto.",
      });
      return;
    }

    try {
      const { action } = await addProductToCart({
        product: producto,
        quantity,
        userId: sessionData.idUsuario,
      });

      setIsAgregadoAlCarrito(true);

      Swal.fire({
        icon: "success",
        title: "Exito",
        text:
          action === "updated"
            ? "El producto se ha actualizado en el carrito."
            : "El producto se ha agregado al carrito.",
      });
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo agregar el producto al carrito.",
      });
    }
  };

  return (
    <div className="b2b-card">
      <div className="b2b-card-image">
        <ProductImage product={producto} alt={producto.nombre} />
        <button
          className={`b2b-wishlist-btn ${isEnLista ? "active" : ""}`}
          onClick={handleWishlistClick}
          aria-label={isEnLista ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
      </div>
      <div className="b2b-card-body">
        <div className="b2b-card-heading">
          <div>
            <h3 className="b2b-card-title">{producto.nombre}</h3>
            <div className="b2b-card-id">{producto.categoria}</div>
          </div>
          <span className="b2b-badge">Stock {producto.cantidad}</span>
        </div>

        <div className="b2b-card-price">
          ${parseFloat(producto.precioVenta).toFixed(2)} <small>MXN</small>
        </div>

        <div className="b2b-card-controls">
          <Link className="b2b-card-detail-link" to={`/producto/${producto.id}`}>
            <FontAwesomeIcon icon={faEye} />
            Ver detalle
          </Link>
          <div className="b2b-quantity-stepper" aria-label="Cantidad">
            <button type="button" onClick={decreaseQuantity} aria-label="Reducir cantidad">
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <input
              type="number"
              min="1"
              max={producto.cantidad}
              value={cantidad}
              onChange={handleCantidadChange}
            />
            <button type="button" onClick={increaseQuantity} aria-label="Aumentar cantidad">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>

        <div className="b2b-card-actions">
          <button
            className="b2b-btn b2b-card-cart-btn"
            onClick={handleAddToCart}
            disabled={isAgregadoAlCarrito}
          >
            <FontAwesomeIcon icon={faShoppingCart} /> {isAgregadoAlCarrito ? "Agregado" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogProductCard;
