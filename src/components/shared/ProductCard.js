import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faDollarSign,
  faMapMarkerAlt,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import ProductImage from "./ProductImage";

const ProductCard = ({
  product,
  badge = null,
  actions = null,
  variant = "store",
  showMeta = true,
  fallbackDescription = "Una pieza versatil para elevar tu espacio con textura, verde y presencia.",
}) => {
  const price = Number(product.precioVenta || 0).toFixed(2);

  return (
    <article className={`plantopia-product-card plantopia-product-card--${variant}`}>
      <div className="plantopia-product-card__media">
        <ProductImage product={product} alt={product.nombre} />
        {badge || product.categoria ? (
          <span className="plantopia-product-card__badge">
            {badge || product.categoria}
          </span>
        ) : null}
      </div>

      <div className="plantopia-product-card__body">
        <h3>{product.nombre}</h3>
        <p>{product.detalles || fallbackDescription}</p>

        {showMeta ? (
          <div className="plantopia-product-card__meta">
            {product.sucursal ? (
              <span>
                <FontAwesomeIcon icon={faMapMarkerAlt} /> Sucursal {product.sucursal}
              </span>
            ) : null}
            {product.categoria ? (
              <span>
                <FontAwesomeIcon icon={faTag} /> {product.categoria}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="plantopia-product-card__footer">
          {showMeta && product.cantidad !== undefined ? (
            <span>
              <FontAwesomeIcon icon={faBoxOpen} /> {product.cantidad} disponibles
            </span>
          ) : null}
          <strong>
            <FontAwesomeIcon icon={faDollarSign} /> {price}
          </strong>
        </div>

        {actions ? <div className="plantopia-product-card__actions">{actions}</div> : null}
      </div>
    </article>
  );
};

export default ProductCard;
