import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateLeft,
  faCashRegister,
  faCreditCard,
  faFileInvoiceDollar,
  faMoneyBillWave,
  faReceipt,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import AdminShell from "./AdminShell";
import { apiFetch } from "../../config/api";

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
  if (!value) {
    return "Sin fecha";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
};

const parseMetadata = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
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

const getMethodTone = (method) => {
  const normalized = String(method || "").toLowerCase();

  if (normalized === "paypal") {
    return "info";
  }

  if (normalized === "efectivo") {
    return "success";
  }

  return "neutral";
};

const getStatusTone = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "pagado") {
    return "success";
  }

  if (normalized === "pendiente") {
    return "warning";
  }

  if (normalized === "fallido") {
    return "danger";
  }

  return "neutral";
};

const PaymentsView = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/verPagos")
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "No se pudieron cargar los pagos.");
        }

        const data = await response.json();

        if (!cancelled) {
          setPayments(Array.isArray(data) ? data : []);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError.message || "No se pudieron cargar los pagos.");
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
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch = !searchTerm || [
        payment.id,
        payment.usuario_nombre,
        payment.usuario_correo,
        payment.referencia,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesMethod =
        methodFilter === "todos" ||
        String(payment.metodo || "").toLowerCase() === methodFilter;

      const matchesStatus =
        statusFilter === "todos" ||
        String(payment.estado || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [payments, searchTerm, methodFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalAmount = filteredPayments.reduce(
      (sum, payment) => sum + Number(payment.total || 0),
      0
    );
    const paid = filteredPayments.filter(
      (payment) => String(payment.estado || "").toLowerCase() === "pagado"
    ).length;
    const paypal = filteredPayments.filter(
      (payment) => String(payment.metodo || "").toLowerCase() === "paypal"
    ).length;

    return {
      totalPayments: filteredPayments.length,
      totalAmount,
      paid,
      paypal,
    };
  }, [filteredPayments]);

  const openDetail = async (paymentId) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setSelectedPayment(null);

    try {
      const response = await apiFetch(`/verPago/${paymentId}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo cargar el detalle del pago.");
      }

      const data = await response.json();
      setSelectedPayment(data);
    } catch (detailError) {
      setSelectedPayment({
        error: detailError.message || "No se pudo cargar el detalle del pago.",
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Finanzas</span>
          <h1 className="admin-page-header__title">Pagos registrados</h1>
          <p className="admin-page-header__text">
            Revisa compras procesadas, metodos de pago, referencias y trazabilidad
            completa por operacion.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link to="/cruds" className="btn admin-page-header__ghost">
            <FontAwesomeIcon icon={faArrowRotateLeft} className="me-2" />
            Volver al panel
          </Link>
        </div>
      </section>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faReceipt} />
          </span>
          <span className="admin-stat-card__label">Pagos visibles</span>
          <strong className="admin-stat-card__value">{stats.totalPayments}</strong>
          <span className="admin-stat-card__meta">Resultados del filtro actual</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faCashRegister} />
          </span>
          <span className="admin-stat-card__label">Monto total</span>
          <strong className="admin-stat-card__value">{formatCurrency(stats.totalAmount)}</strong>
          <span className="admin-stat-card__meta">Suma consolidada de pagos listados</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </span>
          <span className="admin-stat-card__label">Pagados</span>
          <strong className="admin-stat-card__value">{stats.paid}</strong>
          <span className="admin-stat-card__meta">Operaciones marcadas como liquidadas</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faWallet} />
          </span>
          <span className="admin-stat-card__label">PayPal</span>
          <strong className="admin-stat-card__value">{stats.paypal}</strong>
          <span className="admin-stat-card__meta">Compras registradas con proveedor digital</span>
        </article>
      </section>

      <section className="admin-panel-grid admin-panel-grid--users">
        <aside className="admin-side-card">
          <span className="admin-side-card__eyebrow">Consulta</span>
          <h3 className="admin-side-card__title">
            <FontAwesomeIcon icon={faCreditCard} className="me-2" />
            Filtros de pago
          </h3>
          <p className="admin-side-card__text">
            Busca por cliente o referencia y acota por metodo o estado antes de abrir el detalle.
          </p>

          <div className="admin-side-card__controls">
            <label className="admin-field">
              <span className="admin-field__label">Buscar</span>
              <input
                type="text"
                className="form-control admin-field__control"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cliente, correo o referencia"
                autoComplete="off"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Metodo</span>
              <select
                className="form-select admin-field__control"
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="paypal">PayPal</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Estado</span>
              <select
                className="form-select admin-field__control"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="fallido">Fallido</option>
              </select>
            </label>
          </div>

          <div className="admin-side-card__summary">
            <span className="admin-side-card__summary-label">Snapshot</span>
            <strong className="admin-side-card__summary-value">{formatCurrency(stats.totalAmount)}</strong>
            <span className="admin-side-card__summary-copy">
              Total consolidado de los pagos visibles en esta consulta.
            </span>
          </div>
        </aside>

        <section className="admin-table-card">
          <div className="admin-table-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Finanzas</span>
              <h2 className="admin-table-card__title">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                Historial de pagos
              </h2>
            </div>
            <span className="admin-table-card__count">{filteredPayments.length} resultados</span>
          </div>

          {isLoading ? (
            <div className="admin-analytics-loading">
              <Spinner animation="border" />
              <p className="mb-0">Cargando pagos...</p>
            </div>
          ) : error ? (
            <div className="admin-analytics-empty">
              <h3 className="mb-0">No se pudo cargar el modulo</h3>
              <p className="mb-0">{error}</p>
            </div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="table admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Metodo</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Items</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <th>{payment.id}</th>
                        <td>
                          <strong>{payment.usuario_nombre || "Sin usuario"}</strong>
                          <div>{payment.usuario_correo || "Sin correo"}</div>
                        </td>
                        <td>
                          <span className={`admin-tone-pill admin-tone-pill--${getMethodTone(payment.metodo)}`}>
                            {getMethodLabel(payment.metodo)}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-tone-pill admin-tone-pill--${getStatusTone(payment.estado)}`}>
                            {payment.estado || "Sin estado"}
                          </span>
                        </td>
                        <td>{formatCurrency(payment.total)}</td>
                        <td>{payment.unidades || 0}</td>
                        <td>{formatDateTime(payment.fechaRegistro)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-light admin-icon-button"
                            onClick={() => openDetail(payment.id)}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-mobile-list">
                {filteredPayments.map((payment) => (
                  <article className="admin-mobile-card" key={payment.id}>
                    <div className="admin-mobile-card__header">
                      <div>
                        <span className="admin-mobile-card__eyebrow">Pago #{payment.id}</span>
                        <h3 className="admin-mobile-card__title">{payment.usuario_nombre || "Sin usuario"}</h3>
                      </div>
                      <span className={`admin-tone-pill admin-tone-pill--${getStatusTone(payment.estado)}`}>
                        {payment.estado || "Sin estado"}
                      </span>
                    </div>

                    <div className="admin-mobile-card__grid">
                      <div className="admin-mobile-card__item">
                        <span className="admin-mobile-card__label">Metodo</span>
                        <strong>{getMethodLabel(payment.metodo)}</strong>
                      </div>
                      <div className="admin-mobile-card__item">
                        <span className="admin-mobile-card__label">Total</span>
                        <strong>{formatCurrency(payment.total)}</strong>
                      </div>
                      <div className="admin-mobile-card__item">
                        <span className="admin-mobile-card__label">Unidades</span>
                        <strong>{payment.unidades || 0}</strong>
                      </div>
                      <div className="admin-mobile-card__item">
                        <span className="admin-mobile-card__label">Fecha</span>
                        <strong>{formatDateTime(payment.fechaRegistro)}</strong>
                      </div>
                    </div>

                    <div className="admin-mobile-card__actions">
                      <button
                        type="button"
                        className="btn btn-light admin-icon-button"
                        onClick={() => openDetail(payment.id)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </section>

      <Modal
        show={isDetailOpen}
        onHide={() => setIsDetailOpen(false)}
        dialogClassName="admin-modal admin-modal--details"
        size="lg"
        centered
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">Detalle de pago</span>
            <Modal.Title className="admin-modal__title">
              {selectedPayment?.pago ? `Pago #${selectedPayment.pago.id}` : "Pago"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          {isDetailLoading ? (
            <div className="admin-analytics-loading">
              <Spinner animation="border" />
              <p className="mb-0">Cargando detalle...</p>
            </div>
          ) : selectedPayment?.error ? (
            <div className="admin-analytics-empty">
              <p className="mb-0">{selectedPayment.error}</p>
            </div>
          ) : selectedPayment?.pago ? (
            <div className="admin-detail-grid">
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Cliente</span>
                <strong>{selectedPayment.pago.usuario_nombre || "Sin usuario"}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Metodo</span>
                <strong>{getMethodLabel(selectedPayment.pago.metodo)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Estado</span>
                <strong>{selectedPayment.pago.estado || "Sin estado"}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Referencia</span>
                <strong>{selectedPayment.pago.referencia || "Sin referencia"}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Subtotal</span>
                <strong>{formatCurrency(selectedPayment.pago.subtotal)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Total</span>
                <strong>{formatCurrency(selectedPayment.pago.total)}</strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Items</span>
                <strong>
                  {(selectedPayment.items || [])
                    .map((item) => `${item.nombre} x${item.cantidad}`)
                    .join(" | ") || "Sin items"}
                </strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Metadata</span>
                <pre className="admin-json-block">
                  {JSON.stringify(parseMetadata(selectedPayment.pago.metadata), null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </Modal.Body>
      </Modal>
    </AdminShell>
  );
};

export default PaymentsView;
