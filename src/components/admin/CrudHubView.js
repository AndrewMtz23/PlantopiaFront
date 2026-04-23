import React from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import AdminShell from "./AdminShell";

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

const AdminDashboard = () => {
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
      <Row className="g-4">
        {menuItems.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </Row>
    </AdminShell>
  );
};

export default AdminDashboard;
