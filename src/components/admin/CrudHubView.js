import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBuilding,
  faTruckMoving,
  faBroom,
  faBoxes,
  faChartBar,
  faTags,
  faReceipt,
  faListCheck,
  faMoneyBillWave,
  faTriangleExclamation,
  faSeedling,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import AdminShell from "./AdminShell";
import { apiFetch } from "../../config/api";

const menuItems = [
  {
    title: "Usuarios",
    icon: faUser,
    accent: "emerald",
    text: "Altas, bajas y actualizaciones de acceso para clientes y administradores.",
    link: "/usuarios",
  },
  {
    title: "Sucursales",
    icon: faBuilding,
    accent: "forest",
    text: "Controla sedes, responsables y datos de contacto desde un solo lugar.",
    link: "/sucursales",
  },
  {
    title: "Proveedores",
    icon: faTruckMoving,
    accent: "teal",
    text: "Mantiene marcas, contratos y relacion comercial sin perder trazabilidad.",
    link: "/proveedores",
  },
  {
    title: "Productos",
    icon: faBroom,
    accent: "gold",
    text: "Ordena catalogo, precios y materiales con una vista mas clara.",
    link: "/productos",
  },
  {
    title: "Inventarios",
    icon: faBoxes,
    accent: "sage",
    text: "Supervisa existencias por producto, proveedor y sucursal con rapidez.",
    link: "/inventarios",
  },
  {
    title: "Categorias",
    icon: faTags,
    accent: "teal",
    text: "Gestiona las etiquetas dinamicas para clasificar los productos.",
    link: "/categorias",
  },
  {
    title: "Pagos",
    icon: faReceipt,
    accent: "ink",
    text: "Audita compras procesadas, metodos y referencias registradas por operacion.",
    link: "/pagos",
  },
  {
    title: "Logs",
    icon: faListCheck,
    accent: "forest",
    text: "Consulta la bitacora del sistema para seguir eventos, errores y acciones.",
    link: "/logs",
  },
  {
    title: "Graficas",
    icon: faChartBar,
    accent: "ink",
    text: "Consulta metricas de rentabilidad y comportamiento para tomar decisiones.",
    link: "/graficas",
  },
];

const MenuItem = ({ title, icon, accent, text, link }) => (
  <Col md={4} className="mb-4">
    <Card className={`admin-dashboard-card admin-dashboard-card--${accent} h-100`}>
      <Card.Body className="d-flex flex-column">
        <div className="admin-dashboard-card__icon">
          <FontAwesomeIcon icon={icon} size="lg" />
        </div>
        <Card.Title>{title}</Card.Title>
        <Card.Text className="flex-grow-1">{text}</Card.Text>
        <Link to={link} className="mt-auto">
          <Button className="admin-dashboard-card__button w-100">Ir a {title}</Button>
        </Link>
      </Card.Body>
    </Card>
  </Col>
);

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Sin fecha"
    : parsed.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState({
    threshold: 5,
    resumen: {},
    inventarioCritico: [],
    pagosRecientes: [],
    logsRecientes: [],
    productosTop: [],
  });

  useEffect(() => {
    let isMounted = true;

    apiFetch("/dashboardResumen")
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data?.resumen) {
          setDashboard(data);
        }
      })
      .catch((error) => {
        console.error("Error al cargar dashboard:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { resumen } = dashboard;
  const kpis = [
    {
      label: "Ventas totales",
      value: formatCurrency(resumen.ventasTotales),
      meta: `${resumen.pagosProcesados || 0} pagos procesados`,
      icon: faMoneyBillWave,
    },
    {
      label: "Ventas hoy",
      value: formatCurrency(resumen.ventasHoy),
      meta: `${resumen.pagosHoy || 0} pago(s) hoy`,
      icon: faReceipt,
    },
    {
      label: "Productos activos",
      value: resumen.productosActivos || 0,
      meta: `${resumen.inventariosCriticos || 0} con inventario critico`,
      icon: faSeedling,
    },
    {
      label: "Sucursales activas",
      value: resumen.sucursalesActivas || 0,
      meta: `${resumen.usuariosActivos || 0} usuarios activos`,
      icon: faBuilding,
    },
  ];

  return (
    <AdminShell contentClassName="flex-grow-1 py-5">
      <section className="admin-hero">
        <div>
          <span className="admin-hero__eyebrow">Workspace</span>
          <h1 className="admin-hero__title">Centro de control Plantopia</h1>
          <p className="admin-hero__text">
            Organiza la operacion diaria, gestiona catalogo y manten el negocio
            con una interfaz mas clara, solida y profesional.
          </p>
        </div>
        <div className="admin-hero__panel">
          <span className="admin-hero__metric-label">Modulos activos</span>
          <strong className="admin-hero__metric-value">{menuItems.length}</strong>
          <span className="admin-hero__metric-copy">Todo el panel administrativo vive aqui.</span>
        </div>
      </section>
      <section className="admin-critical-strip">
        <div>
          <span className="admin-critical-strip__eyebrow">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            Inventario critico
          </span>
          <strong>{dashboard.inventarioCritico.length}</strong>
          <p>productos con {dashboard.threshold} o menos unidades disponibles.</p>
        </div>
        <div className="admin-critical-strip__list">
          {dashboard.inventarioCritico.length ? (
            dashboard.inventarioCritico.slice(0, 4).map((item) => (
              <Link key={item.id} to="/inventarios" className="admin-critical-item">
                <span>{item.producto_nombre || `Producto ${item.producto}`}</span>
                <strong>{item.cantidad} u.</strong>
                <small>{item.sucursal_nombre || `Sucursal ${item.sucursal}`}</small>
              </Link>
            ))
          ) : (
            <span className="admin-critical-strip__empty">Todo el inventario se ve estable.</span>
          )}
        </div>
      </section>

      <section className="admin-kpi-grid">
        {kpis.map((kpi) => (
          <article className="admin-kpi-card" key={kpi.label}>
            <span className="admin-kpi-card__icon">
              <FontAwesomeIcon icon={kpi.icon} />
            </span>
            <span className="admin-kpi-card__label">{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.meta}</small>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-insights">
        <article className="admin-insight-card">
          <div className="admin-insight-card__header">
            <span><FontAwesomeIcon icon={faReceipt} /> Pagos recientes</span>
            <Link to="/pagos">Ver pagos</Link>
          </div>
          <div className="admin-insight-list">
            {dashboard.pagosRecientes.length ? dashboard.pagosRecientes.map((payment) => (
              <div className="admin-insight-row" key={payment.id}>
                <div>
                  <strong>Pago #{payment.id}</strong>
                  <span>{payment.usuario_nombre || "Cliente Plantopia"} · {formatDate(payment.fechaRegistro)}</span>
                </div>
                <b>{formatCurrency(payment.total)}</b>
              </div>
            )) : <p className="admin-insight-empty">Sin pagos registrados.</p>}
          </div>
        </article>

        <article className="admin-insight-card">
          <div className="admin-insight-card__header">
            <span><FontAwesomeIcon icon={faSeedling} /> Productos top</span>
            <Link to="/graficas">Ver graficas</Link>
          </div>
          <div className="admin-insight-list">
            {dashboard.productosTop.length ? dashboard.productosTop.map((product, index) => (
              <div className="admin-insight-row" key={`${product.nombre}-${index}`}>
                <div>
                  <strong>{product.nombre || "Producto sin nombre"}</strong>
                  <span>{product.cantidad || 0} unidades vendidas</span>
                </div>
                <b>{formatCurrency(product.total)}</b>
              </div>
            )) : <p className="admin-insight-empty">Aun no hay ventas suficientes.</p>}
          </div>
        </article>

        <article className="admin-insight-card admin-insight-card--wide">
          <div className="admin-insight-card__header">
            <span><FontAwesomeIcon icon={faClockRotateLeft} /> Actividad reciente</span>
            <Link to="/logs">Ver logs</Link>
          </div>
          <div className="admin-timeline-list">
            {dashboard.logsRecientes.length ? dashboard.logsRecientes.map((log) => (
              <div className={`admin-timeline-item admin-timeline-item--${log.nivel || "info"}`} key={log.id}>
                <span />
                <div>
                  <strong>{log.descripcion}</strong>
                  <small>{log.modulo} · {log.accion} · {formatDate(log.fechaRegistro)}</small>
                </div>
              </div>
            )) : <p className="admin-insight-empty">Sin actividad reciente.</p>}
          </div>
        </article>
      </section>

      <Row className="g-4">
        {menuItems.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </Row>
    </AdminShell>
  );
};

export default AdminDashboard;
