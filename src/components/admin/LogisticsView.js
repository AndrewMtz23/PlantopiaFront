import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Spinner, Badge, Button, Form, Tabs, Tab } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateLeft,
  faClipboardList,
  faCheckCircle,
  faMapMarkerAlt,
  faUser,
  faBoxOpen,
  faRoute,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import AdminShell from "./AdminShell";
import { apiFetch } from "../../config/api";
import { getSessionData } from "../../utils/session";
import toast from "react-hot-toast";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const getDeliveryRoute = (order) => getDeliveryAddress(order?.direccionEntrega)?.rutaEntrega || null;

const getDeliveryAddress = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const LogisticsView = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("pendientes");
  
  const sessionData = getSessionData();
  const userType = Number(sessionData?.tipo);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = "/commerce/pedidos/pendientes";
      
      if (userType === 4) {
        endpoint = activeTab === "pendientes" ? "/commerce/reparto/disponibles" : "/commerce/reparto/mis-entregas";
      }

      const response = await apiFetch(endpoint);
      if (!response.ok) throw new Error("No se pudieron cargar los pedidos.");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [userType, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsSaving(true);
    try {
      const response = await apiFetch(`/commerce/pedidos/estado/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error("Error al actualizar estado");
      
      toast.success(`Pedido actualizado a: ${newStatus}`);
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignToMe = async (orderId) => {
    setIsSaving(true);
    try {
      const response = await apiFetch(`/commerce/reparto/asignar/${orderId}`, {
        method: "POST"
      });
      
      if (!response.ok) throw new Error("No se pudo asignar el pedido");
      
      toast.success("Pedido asignado correctamente");
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const tones = {
      preparando: "warning",
      listo: "info",
      enviado: "primary",
      entregado: "success",
      cancelado: "danger"
    };
    return <Badge bg={tones[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Operaciones</span>
          <h1 className="admin-page-header__title">Gestión de Logística</h1>
          <p className="admin-page-header__text">
            {userType === 4 
              ? "Revisa los pedidos listos para ser entregados y asígnatelos."
              : "Administra el surtido y preparación de los pedidos de los clientes."}
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link to="/cruds" className="btn admin-page-header__ghost">
            <FontAwesomeIcon icon={faArrowRotateLeft} className="me-2" />
            Volver
          </Link>
          <Button onClick={fetchOrders} variant="success">
            Actualizar Lista
          </Button>
        </div>
      </section>

      {userType === 4 && (
        <div className="mb-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="admin-tabs"
          >
            <Tab eventKey="pendientes" title="Pedidos por Entregar" />
            <Tab eventKey="mis-entregas" title="Mis Entregas en Curso" />
          </Tabs>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Cargando pedidos operativos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-analytics-empty py-5 text-center">
          <FontAwesomeIcon icon={faClipboardList} size="3x" className="mb-3 text-muted" />
          <h3>No hay pedidos pendientes</h3>
          <p>Todo está al día por ahora.</p>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div className="col-md-6 col-lg-4" key={order.id}>
              <div className="admin-dashboard-card h-100 p-4 d-flex flex-column border">
                {(() => {
                  const route = getDeliveryRoute(order);
                  return (
                    <>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="text-muted small">Pedido #{order.id}</span>
                    <h5 className="mb-0 mt-1 font-weight-bold">
                      <FontAwesomeIcon icon={faUser} className="me-2 text-success" />
                      {order.tusuarios?.nombre || "Cliente"}
                    </h5>
                  </div>
                  {getStatusBadge(order.estadoEntrega)}
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faBoxOpen} className="me-2 text-muted" />
                    <span>{order.tventas?.length || 0} productos</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" />
                    <span className="small text-truncate">
                      {getDeliveryAddress(order.direccionEntrega)?.domicilio || "Recoger en tienda"}
                    </span>
                  </div>
                  {route ? (
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faRoute} className="me-2 text-success" />
                      <span className="small">
                        {route.sucursalOrigen?.nombre || "Sucursal origen"}
                        {route.distanciaKm ? ` - ${route.distanciaKm} km` : ""}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                  <strong className="text-success">{formatCurrency(order.total)}</strong>
                  {route?.googleMapsUrl ? (
                    <a
                      className="btn btn-sm btn-outline-primary"
                      href={route.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                      Ruta
                    </a>
                  ) : null}
                  {userType === 4 ? (
                    <div className="d-flex gap-2">
                      {activeTab === "pendientes" ? (
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleAssignToMe(order.id)}
                          disabled={isSaving || order.estadoEntrega !== "listo"}
                        >
                          {order.estadoEntrega === "listo" ? "Asignarme" : "En preparacion"}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline-success"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                        >
                          Gestionar Entrega
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline-success"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                    >
                      Gestionar
                    </Button>
                  )}
                </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Gestión para Empleado */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {userType === 4 ? `Gestionar Entrega #${selectedOrder?.id}` : `Surtir Pedido #${selectedOrder?.id}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <h6>Productos a preparar:</h6>
              <ul className="list-group list-group-flush mb-4">
                {selectedOrder.tventas?.map((v, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>{v.tproductos?.nombre}</span>
                    <Badge bg="light" text="dark">x{v.cantidad}</Badge>
                  </li>
                ))}
              </ul>
              {getDeliveryRoute(selectedOrder) ? (
                <div className="border rounded p-3 mb-4">
                  <h6 className="mb-2">Ruta de entrega</h6>
                  <p className="mb-1">
                    <strong>Origen:</strong> {getDeliveryRoute(selectedOrder).sucursalOrigen?.nombre}
                  </p>
                  <p className="mb-2">
                    <strong>Distancia:</strong> {getDeliveryRoute(selectedOrder).distanciaKm || "N/D"} km
                  </p>
                  {getDeliveryRoute(selectedOrder).googleMapsUrl ? (
                    <a href={getDeliveryRoute(selectedOrder).googleMapsUrl} target="_blank" rel="noreferrer">
                      Abrir ruta en Google Maps
                    </a>
                  ) : null}
                </div>
              ) : null}
              <Form.Group className="mb-3">
                <Form.Label>Cambiar Estado a:</Form.Label>
                <div className="d-grid gap-2">
                  {userType === 4 ? (
                    <>
                      {selectedOrder.estadoEntrega === 'listo' && (
                        <Button 
                          variant="outline-primary" 
                          onClick={() => handleUpdateStatus(selectedOrder.id, "enviado")}
                          disabled={isSaving}
                        >
                          <FontAwesomeIcon icon={faRoute} className="me-2" />
                          Marcar "En Camino"
                        </Button>
                      )}
                      {selectedOrder.estadoEntrega === 'enviado' && (
                        <Button 
                          variant="success" 
                          onClick={() => handleUpdateStatus(selectedOrder.id, "entregado")}
                          disabled={isSaving}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                          Confirmar Entrega
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline-info" 
                        onClick={() => handleUpdateStatus(selectedOrder.id, "listo")}
                        disabled={isSaving}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        Listo para Entrega
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        onClick={() => handleUpdateStatus(selectedOrder.id, "cancelado")}
                        disabled={isSaving}
                      >
                        Cancelar Pedido
                      </Button>
                    </>
                  )}
                </div>
              </Form.Group>
            </>
          )}
        </Modal.Body>
      </Modal>
    </AdminShell>
  );
};

export default LogisticsView;
