import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faFileInvoiceDollar,
  faLocationDot,
  faLeaf,
  faReceipt,
  faShoppingBag,
  faTruckFast,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { apiFetch } from "../../config/api";
import { getSessionData } from "../../utils/session";
import { generarFacturaPDF } from "../pdf/pdfCarrito";
import Footer from "../decoraciones/footer";
import ProductImage from "../shared/ProductImage";
import PublicHeader from "../shared/PublicHeader";
import "../css/PublicSite.css";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const DETAILS_EMPRESA = {
  nombre: "Plantopia",
  ubicacion: "Calle Ficticia #123, Ciudad Ficticia",
  correo: "info@plantopia.com.mx",
  telefono: "+1 (555) 123-4567",
};

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatDateTime = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Sin fecha" : dateFormatter.format(parsed);
};

const getMethodLabel = (method) => {
  const normalized = String(method || "").toLowerCase();

  if (normalized === "paypal") {
    return "PayPal";
  }

  if (normalized === "efectivo") {
    return "Efectivo";
  }

  return method || "Sin metodo";
};

const parseDeliveryAddress = (payment = {}) => {
  if (!payment.direccionEntrega) {
    return null;
  }

  if (typeof payment.direccionEntrega === "object") {
    return payment.direccionEntrega;
  }

  try {
    return JSON.parse(payment.direccionEntrega);
  } catch (error) {
    return null;
  }
};

const formatDeliveryAddress = (address = {}) =>
  [
    address.domicilio,
    [address.ciudad, address.estadoDireccion].filter(Boolean).join(", "),
    address.codigoPostal ? `CP ${address.codigoPostal}` : "",
  ].filter(Boolean).join(" - ");

const getDeliveryStatusLabel = (status) => {
  const labels = {
    preparando: "Preparando",
    listo: "Listo para reparto",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  return labels[String(status || "").toLowerCase()] || "Preparando";
};

const formatShortDate = (value) => {
  if (!value) {
    return "Sin fecha estimada";
  }

  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(parsed);
};

const PurchaseConfirmationView = () => {
  const { paymentId } = useParams();
  const sessionData = getSessionData();
  const [purchase, setPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiFetch(`/miPago/${sessionData.idUsuario}/${paymentId}`)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "No se pudo cargar la confirmacion.");
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPurchase(data);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError.message || "No se pudo cargar la confirmacion.");
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
  }, [paymentId, sessionData.idUsuario]);

  const totals = useMemo(() => {
    const pago = purchase?.pago || {};

    return [
      { label: "Subtotal", value: formatCurrency(pago.subtotal) },
      { label: "IVA", value: formatCurrency(pago.iva) },
      { label: "Envio", value: formatCurrency(pago.envio) },
      { label: "Total", value: formatCurrency(pago.total), strong: true },
    ];
  }, [purchase]);

  const deliveryAddress = useMemo(
    () => parseDeliveryAddress(purchase?.pago || {}),
    [purchase]
  );

  const generateInvoice = () => {
    if (!purchase?.items?.length) {
      Swal.fire("Sin productos", "No hay productos para generar comprobante.", "info");
      return;
    }

    const domicilio = deliveryAddress
      ? formatDeliveryAddress(deliveryAddress)
      : purchase.pago?.usuario_domicilio;
    const items = purchase.items.map((item) => ({
      ...item,
      usuario_nombre: deliveryAddress?.nombre || purchase.pago?.usuario_nombre,
      telefono: deliveryAddress?.telefono || purchase.pago?.usuario_telefono,
      correo: deliveryAddress?.correo || purchase.pago?.usuario_correo,
      domicilio,
      precioVenta: Number(item.total || 0) / Number(item.cantidad || 1),
      subtotal: Number(item.total || 0),
    }));

    generarFacturaPDF(items, purchase.pago, DETAILS_EMPRESA);
  };

  const handleSearch = (event) => {
    event.preventDefault();
  };

  return (
    <div className="homepage public-site purchase-confirmation-page">
      <PublicHeader
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearch}
        searchPlaceholder="Buscar plantas..."
      />

      <main className="public-site__main">
        {isLoading ? (
          <section className="public-section">
            <div className="public-shell purchase-empty-state">
              <Spinner animation="border" />
              <p>Cargando confirmacion...</p>
            </div>
          </section>
        ) : error ? (
          <section className="public-section">
            <div className="public-shell purchase-empty-state">
              <strong>No se pudo cargar la compra</strong>
              <p>{error}</p>
              <Link to="/mis-compras" className="public-button public-button--primary">
                Ver mis compras
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="purchase-confirmation-hero">
              <div className="public-shell purchase-confirmation-hero__grid">
                <div>
                  <span className="purchase-confirmation-hero__icon">
                    <FontAwesomeIcon icon={faCircleCheck} />
                  </span>
                  <span className="public-page-hero__eyebrow">Pedido registrado</span>
                  <h1 className="public-page-hero__title">Tu pedido ya esta registrado</h1>
                  <p className="public-page-hero__copy">
                    {purchase.pago.estado === "pendiente" ? "Pendiente de cobro en efectivo. Este comprobante acredita el pedido, no el pago." : "Consulta el estado de tu pedido y su comprobante."}
                  </p>
                  <div className="public-inline-actions">
                    <button type="button" className="public-button public-button--primary" onClick={generateInvoice}>
                      <FontAwesomeIcon icon={faFileInvoiceDollar} />
                      Descargar comprobante
                    </button>
                    <Link to="/mis-compras" className="public-button public-button--ghost">
                      <FontAwesomeIcon icon={faReceipt} />
                      Ver historial
                    </Link>
                  </div>
                </div>

                <aside className="purchase-confirmation-ticket">
                  <span>Folio</span>
                  <strong>#{purchase.pago.id}</strong>
                  <p>{formatDateTime(purchase.pago.fechaRegistro)}</p>
                  <div>
                    <FontAwesomeIcon icon={faWallet} />
                    {getMethodLabel(purchase.pago.metodo)}
                  </div>
                </aside>
              </div>
            </section>

            <section className="public-section">
              <div className="public-shell purchase-confirmation-layout">
                <section className="purchase-confirmation-items">
                  <div className="purchase-confirmation-section-title">
                    <FontAwesomeIcon icon={faShoppingBag} />
                    <div>
                      <span>Detalle</span>
                      <h2>Productos comprados</h2>
                    </div>
                  </div>

                  {(purchase.items || []).map((item) => (
                    <article className="purchase-confirmation-item" key={item.id}>
                      <ProductImage
                        product={item}
                        alt={item.nombre}
                        className="purchase-confirmation-item__image"
                      />
                      <div>
                        <strong>{item.nombre}</strong>
                        <span>{item.categoria}</span>
                        <p>{item.detalles}</p>
                      </div>
                      <div>
                        <span>{item.cantidad} u.</span>
                        <strong>{formatCurrency(item.total)}</strong>
                      </div>
                    </article>
                  ))}
                </section>

                <aside className="purchase-confirmation-summary">
                  <div className="purchase-confirmation-section-title">
                    <FontAwesomeIcon icon={faLeaf} />
                    <div>
                      <span>Resumen</span>
                      <h2>Pago</h2>
                    </div>
                  </div>

                  <div className="purchase-confirmation-summary__rows">
                    {totals.map((row) => (
                      <div key={row.label} className={row.strong ? "is-strong" : ""}>
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>

                  {deliveryAddress && (
                    <div className="purchase-confirmation-delivery">
                      <span>Entrega</span>
                      <strong>{deliveryAddress.nombre}</strong>
                      <p>{formatDeliveryAddress(deliveryAddress)}</p>
                      {deliveryAddress.referenciasDomicilio && (
                        <small>{deliveryAddress.referenciasDomicilio}</small>
                      )}
                    </div>
                  )}

                  <div className="purchase-confirmation-tracking">
                    <div>
                      <FontAwesomeIcon icon={faTruckFast} />
                      <span>Entrega</span>
                      <strong>{getDeliveryStatusLabel(purchase.pago.estadoEntrega)}</strong>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faLocationDot} />
                      <span>Fecha estimada</span>
                      <strong>{formatShortDate(purchase.pago.fechaEstimadaEntrega)}</strong>
                    </div>
                    {purchase.pago.guiaEntrega && (
                      <div>
                        <FontAwesomeIcon icon={faReceipt} />
                        <span>Guia</span>
                        <strong>{purchase.pago.guiaEntrega}</strong>
                      </div>
                    )}
                  </div>

                  <Link to="/catalogo" className="public-button public-button--ghost">
                    Seguir comprando
                  </Link>
                </aside>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PurchaseConfirmationView;
