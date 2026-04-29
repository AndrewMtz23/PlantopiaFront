import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarDays,
  faFileInvoiceDollar,
  faLeaf,
  faLocationDot,
  faReceipt,
  faSearch,
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

const DETAILS_EMPRESA = {
  nombre: "Plantopia",
  ubicacion: "Calle Ficticia #123, Ciudad Ficticia",
  correo: "info@plantopia.com.mx",
  telefono: "+1 (555) 123-4567",
};

const PurchaseHistoryView = () => {
  const sessionData = getSessionData();
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiFetch(`/misPagos/${sessionData.idUsuario}`)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "No se pudieron cargar tus compras.");
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPurchases(Array.isArray(data) ? data : []);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError.message || "No se pudieron cargar tus compras.");
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
  }, [sessionData.idUsuario]);

  const filteredPurchases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return purchases;
    }

    return purchases.filter((purchase) =>
      [
        purchase.id,
        purchase.metodo,
        purchase.estado,
        purchase.estadoEntrega,
        purchase.guiaEntrega,
        purchase.referencia,
        formatCurrency(purchase.total),
        formatDateTime(purchase.fechaRegistro),
      ].some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [purchases, searchTerm]);

  const stats = useMemo(() => {
    const totalSpent = filteredPurchases.reduce(
      (sum, purchase) => sum + Number(purchase.total || 0),
      0
    );
    const totalUnits = filteredPurchases.reduce(
      (sum, purchase) => sum + Number(purchase.unidades || 0),
      0
    );

    return {
      totalSpent,
      totalUnits,
      totalPurchases: filteredPurchases.length,
    };
  }, [filteredPurchases]);

  const openDetail = async (purchaseId) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setSelectedPurchase(null);

    try {
      const response = await apiFetch(`/miPago/${sessionData.idUsuario}/${purchaseId}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo cargar el detalle.");
      }

      setSelectedPurchase(await response.json());
    } catch (detailError) {
      setSelectedPurchase({
        error: detailError.message || "No se pudo cargar el detalle.",
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const generateInvoice = () => {
    if (!selectedPurchase?.items?.length) {
      Swal.fire("Sin productos", "No hay productos para generar factura.", "info");
      return;
    }

    const deliveryAddress = parseDeliveryAddress(selectedPurchase.pago);
    const domicilio = deliveryAddress
      ? formatDeliveryAddress(deliveryAddress)
      : selectedPurchase.pago?.usuario_domicilio;
    const items = selectedPurchase.items.map((item) => ({
      ...item,
      usuario_nombre: deliveryAddress?.nombre || selectedPurchase.pago?.usuario_nombre,
      telefono: deliveryAddress?.telefono || selectedPurchase.pago?.usuario_telefono,
      correo: deliveryAddress?.correo || selectedPurchase.pago?.usuario_correo,
      domicilio,
      precioVenta: Number(item.total || 0) / Number(item.cantidad || 1),
      subtotal: Number(item.total || 0),
    }));

    generarFacturaPDF(items, Number(selectedPurchase.pago?.subtotal || 0), DETAILS_EMPRESA);
  };

  const handleSearch = (event) => {
    event.preventDefault();
  };

  return (
    <div className="homepage public-site purchase-history-page">
      <PublicHeader
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearch}
        searchPlaceholder="Buscar compras..."
      />

      <main className="public-site__main">
        <section className="public-page-hero public-page-hero--compact">
          <div className="public-shell public-page-hero__grid">
            <div>
              <span className="public-page-hero__eyebrow">Mi cuenta</span>
              <h1 className="public-page-hero__title">Historial de compras</h1>
              <p className="public-page-hero__copy">
                Revisa tus pedidos procesados, consulta el detalle de productos y
                genera tu comprobante cuando lo necesites.
              </p>
            </div>
            <div className="purchase-summary-card">
              <span>
                <FontAwesomeIcon icon={faWallet} />
                Compras visibles
              </span>
              <strong>{stats.totalPurchases}</strong>
              <p>{formatCurrency(stats.totalSpent)} acumulados en esta consulta.</p>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="public-shell purchase-layout">
            <aside className="purchase-side-panel">
              <label className="purchase-search">
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por folio, metodo o estado"
                />
              </label>

              <div className="purchase-mini-stats">
                <div>
                  <span>Compras</span>
                  <strong>{stats.totalPurchases}</strong>
                </div>
                <div>
                  <span>Unidades</span>
                  <strong>{stats.totalUnits}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatCurrency(stats.totalSpent)}</strong>
                </div>
              </div>

              <Link to="/catalogo" className="public-button public-button--ghost">
                <FontAwesomeIcon icon={faArrowLeft} />
                Volver al catalogo
              </Link>
            </aside>

            <section className="purchase-list-panel">
              {isLoading ? (
                <div className="purchase-empty-state">
                  <Spinner animation="border" />
                  <p>Cargando compras...</p>
                </div>
              ) : error ? (
                <div className="purchase-empty-state">
                  <strong>No se pudo cargar el historial</strong>
                  <p>{error}</p>
                </div>
              ) : filteredPurchases.length ? (
                filteredPurchases.map((purchase) => (
                  <article className="purchase-card" key={purchase.id}>
                    <div className="purchase-card__main">
                      <span className="purchase-card__icon">
                        <FontAwesomeIcon icon={faReceipt} />
                      </span>
                      <div>
                        <span className="purchase-card__eyebrow">Compra #{purchase.id}</span>
                        <h2>{formatCurrency(purchase.total)}</h2>
                        <p>
                          {purchase.productos || 0} producto(s), {purchase.unidades || 0} unidad(es)
                        </p>
                      </div>
                    </div>

                    <div className="purchase-card__meta">
                      <span>
                        <FontAwesomeIcon icon={faCalendarDays} />
                        {formatDateTime(purchase.fechaRegistro)}
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faWallet} />
                        {getMethodLabel(purchase.metodo)}
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faTruckFast} />
                        {getDeliveryStatusLabel(purchase.estadoEntrega)}
                      </span>
                    </div>

                    <div className="purchase-card__actions">
                      <span className="purchase-status-pill">{purchase.estado || "Sin estado"}</span>
                      <button
                        type="button"
                        className="public-button public-button--primary"
                        onClick={() => openDetail(purchase.id)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="purchase-empty-state">
                  <FontAwesomeIcon icon={faLeaf} />
                  <strong>Aun no hay compras para mostrar</strong>
                  <p>Cuando finalices tu primera compra, aparecera aqui.</p>
                  <Link to="/catalogo" className="public-button public-button--primary">
                    Ir al catalogo
                  </Link>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <Footer />

      <Modal
        show={isDetailOpen}
        onHide={() => setIsDetailOpen(false)}
        centered
        size="lg"
        dialogClassName="purchase-detail-modal"
      >
        <Modal.Header closeButton>
          <div>
            <span className="purchase-detail-modal__eyebrow">Detalle de compra</span>
            <Modal.Title>
              {selectedPurchase?.pago ? `Compra #${selectedPurchase.pago.id}` : "Compra"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          {isDetailLoading ? (
            <div className="purchase-empty-state">
              <Spinner animation="border" />
              <p>Cargando detalle...</p>
            </div>
          ) : selectedPurchase?.error ? (
            <div className="purchase-empty-state">
              <strong>No se pudo cargar el detalle</strong>
              <p>{selectedPurchase.error}</p>
            </div>
          ) : selectedPurchase?.pago ? (
            <div className="purchase-detail">
              <div className="purchase-detail__summary">
                <div>
                  <span>Metodo</span>
                  <strong>{getMethodLabel(selectedPurchase.pago.metodo)}</strong>
                </div>
                <div>
                  <span>Estado</span>
                  <strong>{selectedPurchase.pago.estado}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatCurrency(selectedPurchase.pago.total)}</strong>
                </div>
              </div>

              {parseDeliveryAddress(selectedPurchase.pago) && (
                <div className="purchase-detail__delivery">
                  <span>Entrega</span>
                  <strong>{parseDeliveryAddress(selectedPurchase.pago).nombre}</strong>
                  <p>{formatDeliveryAddress(parseDeliveryAddress(selectedPurchase.pago))}</p>
                  {parseDeliveryAddress(selectedPurchase.pago).referenciasDomicilio && (
                    <small>{parseDeliveryAddress(selectedPurchase.pago).referenciasDomicilio}</small>
                  )}
                </div>
              )}

              <div className="purchase-detail__tracking">
                <div>
                  <FontAwesomeIcon icon={faTruckFast} />
                  <span>Estado de entrega</span>
                  <strong>{getDeliveryStatusLabel(selectedPurchase.pago.estadoEntrega)}</strong>
                </div>
                <div>
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>Fecha estimada</span>
                  <strong>{formatShortDate(selectedPurchase.pago.fechaEstimadaEntrega)}</strong>
                </div>
                {selectedPurchase.pago.guiaEntrega && (
                  <div>
                    <FontAwesomeIcon icon={faReceipt} />
                    <span>Guia</span>
                    <strong>{selectedPurchase.pago.guiaEntrega}</strong>
                  </div>
                )}
                {selectedPurchase.pago.notasEntrega && (
                  <p>{selectedPurchase.pago.notasEntrega}</p>
                )}
              </div>

              <div className="purchase-detail__items">
                {(selectedPurchase.items || []).map((item) => (
                  <article className="purchase-detail-item" key={item.id}>
                    <ProductImage
                      product={item}
                      alt={item.nombre}
                      className="purchase-detail-item__image"
                    />
                    <div>
                      <strong>{item.nombre}</strong>
                      <span>{item.categoria}</span>
                      <small>{item.detalles}</small>
                    </div>
                    <div>
                      <span>{item.cantidad} u.</span>
                      <strong>{formatCurrency(item.total)}</strong>
                    </div>
                  </article>
                ))}
              </div>

              <button type="button" className="public-button public-button--primary" onClick={generateInvoice}>
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                Generar comprobante
              </button>
            </div>
          ) : null}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PurchaseHistoryView;
