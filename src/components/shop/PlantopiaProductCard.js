import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faDollarSign,
  faLocationDot,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
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
    <article className="b2b-card">
      <div className="b2b-card-image">
        <ProductImage product={product} alt={product.nombre} />
      </div>

      <div className="b2b-card-body">
        <h3 className="b2b-card-title">{product.nombre}</h3>
        <div className="b2b-card-id">{product.categoria || "Catalogo"}</div>
        {badge ? <div style={{ fontSize: "12px", color: "#64748b", marginTop: "-8px", marginBottom: "8px" }}>{badge}</div> : null}

        {showMeta ? (
          <div className="b2b-card-meta">
            <span className="b2b-badge" style={{ backgroundColor: "#e2e8f0", color: "#475569" }}>
              Suc {product.sucursal}
            </span>
            <span className="b2b-badge">En stock</span>
          </div>
        ) : null}

        <div className="b2b-card-price" style={{ margin: "16px 0", fontSize: "18px", fontWeight: "700" }}>
          ${parseFloat(price).toFixed(2)} <small style={{ fontSize: "12px", color: "#64748b", fontWeight: "400" }}>MXN</small>
        </div>

        <div className="b2b-card-actions" style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
          {children}
        </div>
      </div>
    </article>
  );
};

export default PlantopiaProductCard;
