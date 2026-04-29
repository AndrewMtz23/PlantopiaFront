import React from "react";
import "../css/Catalogo.css";
import ProductImage from "../shared/ProductImage";

const PlantopiaProductCard = ({
  product,
  badge,
  children,
  variant = "catalog",
  showMeta = variant === "catalog",
}) => {
  const price = Number(product.precioVenta || product.precio || 0).toFixed(2);

  return (
    <article className={`b2b-card b2b-card--${variant}`}>
      <div className="b2b-card-image">
        <ProductImage product={product} alt={product.nombre} />
        {badge ? <span className="b2b-card-editorial-badge">{badge}</span> : null}
      </div>

      <div className="b2b-card-body">
        <div className="b2b-card-heading">
          <div>
            <h3 className="b2b-card-title">{product.nombre}</h3>
            <div className="b2b-card-id">{product.categoria || "Catalogo"}</div>
          </div>
        </div>

        {showMeta ? (
          <div className="b2b-card-meta">
            {product.sucursal ? <span className="b2b-badge">Suc {product.sucursal}</span> : null}
            <span className="b2b-badge">Stock {product.cantidad || "ok"}</span>
          </div>
        ) : null}

        <div className="b2b-card-price">
          ${parseFloat(price).toFixed(2)} <small>MXN</small>
        </div>

        {children ? <div className="b2b-card-actions b2b-card-actions--home">{children}</div> : null}
      </div>
    </article>
  );
};

export default PlantopiaProductCard;
