import React, { useState, useEffect, useCallback, useRef } from "react";
import Axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faMinus, faTrash, faCreditCard, faLocationDot, faRotateLeft, faLocationCrosshairs
} from '@fortawesome/free-solid-svg-icons';
import { Alert, Button, Table, Form, Container, Card, Row, Col } from "react-bootstrap";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../css/Catalogo.css';
import Footer from '../decoraciones/footer';
import { getSessionData, isAuthenticated } from "../../utils/session";
import { deleteCartItem, getCart, getQuote, getPendingPurchase, processPurchase, updateCartItem } from "../../services/cartService";
import PublicHeader from "../shared/PublicHeader";
import ProductImage from "../shared/ProductImage";
import BranchMap from "../admin/BranchMap";


const CartView = () => {
  const [carrito, setCarrito] = useState([]);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    domicilio: "",
    ciudad: "",
    estadoDireccion: "",
    codigoPostal: "",
    referenciasDomicilio: "",
    latitud: null,
    longitud: null,
  });
  const [profileAddress, setProfileAddress] = useState(null);
  const sessionData = getSessionData();
  const userId = sessionData?.idUsuario;
  const isUserLoggedIn = isAuthenticated(sessionData);
  const navigate = useNavigate();
  const pending = getPendingPurchase(userId);

  const obtenerCarrito = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const cartItems = await getCart(userId);
      setCarrito(cartItems);

      setQuote(await getQuote());
    } catch (fetchError) {
      console.error("Error al obtener el carrito:", fetchError);
      setQuote(null);
      setError("No se pudo actualizar el carrito. Revisa disponibilidad antes de comprar.");
    }
  }, [userId]);

  useEffect(() => {
    obtenerCarrito();
  }, [obtenerCarrito]);

  const normalizeAddressFromProfile = useCallback((user = {}) => ({
    nombre: user.nombre || "",
    telefono: user.telefono || "",
    correo: user.correo || "",
    domicilio: user.domicilio || "",
    ciudad: user.ciudad || "",
    estadoDireccion: user.estadoDireccion || "",
    codigoPostal: user.codigoPostal || "",
    referenciasDomicilio: user.referenciasDomicilio || "",
    latitud: user.latitud || null,
    longitud: user.longitud || null,
  }), []);

  const obtenerPerfilEntrega = useCallback(async () => {
    try {
      const response = await Axios.get("/perfil");
      const nextAddress = normalizeAddressFromProfile(response.data.usuario || {});
      setProfileAddress(nextAddress);
      setDeliveryAddress(nextAddress);
    } catch (profileError) {
      console.error("Error al obtener perfil para entrega:", profileError);
    }
  }, [normalizeAddressFromProfile]);

  useEffect(() => {
    if (userId && isUserLoggedIn) {
      obtenerPerfilEntrega();
    }
  }, [obtenerPerfilEntrega, isUserLoggedIn, userId]);

  const editarItemCarrito = async (id, nuevaCantidad, nuevoSubtotal) => {
    try {
      await updateCartItem({
        id,
        quantity: nuevaCantidad,
        subtotal: nuevoSubtotal,
      });
      obtenerCarrito();
    } catch (updateError) {
      console.error("Error al editar el carrito:", updateError);
      setError("Error al editar el carrito");
    }
  };

  const eliminarItemCarrito = async (id) => {
    try {
      await deleteCartItem(id);
      obtenerCarrito();
    } catch (deleteError) {
      console.error("Error al eliminar del carrito:", deleteError);
      setError("Error al eliminar del carrito");
    }
  };

  const updateDeliveryField = (field, value) => {
    setDeliveryAddress((current) => ({
      ...current,
      [field]: field === "codigoPostal" ? value.replace(/\D/g, "") : value,
    }));
  };

  const updateDeliveryLocation = (location) => {
    setDeliveryAddress((current) => ({
      ...current,
      latitud: location.latitud,
      longitud: location.longitud,
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no permite obtener ubicacion automaticamente.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateDeliveryLocation({
          latitud: Number(position.coords.latitude.toFixed(8)),
          longitud: Number(position.coords.longitude.toFixed(8)),
        });
        setError(null);
      },
      () => {
        setError("No se pudo obtener tu ubicacion. Puedes marcarla directamente en el mapa.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const validarDireccionEntrega = () => {
    if (!deliveryAddress.nombre || deliveryAddress.nombre.trim().length < 3) {
      return "El nombre de entrega debe tener al menos 3 caracteres.";
    }

    if (!deliveryAddress.telefono || deliveryAddress.telefono.replace(/\D/g, "").length < 10) {
      return "El telefono de entrega debe tener al menos 10 digitos.";
    }

    if (!deliveryAddress.correo) {
      return "El correo de entrega es obligatorio.";
    }

    if (!deliveryAddress.domicilio || deliveryAddress.domicilio.trim().length < 8) {
      return "La calle y numero de entrega deben ser mas especificos.";
    }

    if (!deliveryAddress.ciudad || deliveryAddress.ciudad.trim().length < 2) {
      return "La ciudad de entrega es obligatoria.";
    }

    if (!deliveryAddress.estadoDireccion || deliveryAddress.estadoDireccion.trim().length < 2) {
      return "El estado de entrega es obligatorio.";
    }

    if (
      !deliveryAddress.codigoPostal ||
      deliveryAddress.codigoPostal.length !== 5
    ) {
      return "El codigo postal de entrega debe tener 5 digitos.";
    }



    return null;
  };

  const restaurarDireccionPerfil = () => {
    if (profileAddress) {
      setDeliveryAddress(profileAddress);
    }
  };

  const realizarPago = async () => {
    if (inFlight.current) return;
    if (!pending) {
      const addressError = validarDireccionEntrega();
      if (addressError) { setError(addressError); return; }
      if (!quote) { setError('Actualiza el carrito antes de confirmar.'); return; }
    }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const result = await processPurchase(userId, { quoteHash: quote?.quoteHash, deliveryAddress });
      navigate('/compra-confirmada/' + result.pagoId, { replace: true });
    } catch (error) {
      setError(error.response?.data?.error?.message || error.response?.data?.error || 'No se pudo confirmar. Reintenta para consultar el mismo pedido.');
      if (error.response?.status === 409) await obtenerCarrito();
    } finally { inFlight.current = false; setSubmitting(false); }
  };

  if (!isUserLoggedIn) {
    return (
      <Alert variant="danger">
        Lo sentimos, debes iniciar sesion para ver este contenido.{" "}
        <Link to="/auth/login">Haz clic aqui para iniciar sesion</Link>.
      </Alert>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="b2b-store-page cart-page">
      <PublicHeader
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearch}
      />

      <main className="cart-page__main">
        <Container className="cart-page__shell">
          {error && <Alert variant="danger">{error}</Alert>}
            {pending && <Alert variant="warning">Hay un pedido pendiente de confirmar. El reintento conserva su direccion y total originales. <Button disabled={submitting} onClick={realizarPago}>Reintentar mismo pedido</Button></Alert>}
          {carrito.length === 0 ? (
            <Alert variant="info" className="cart-page__empty">
              El carrito esta vacio. <Link to="/Catalogo">Continua comprando</Link>
            </Alert>
          ) : (
            <>
              <Card className="commerce-card mb-4">
                <Card.Body className="commerce-card__body">
                  <Table responsive hover className="commerce-table">
                    <thead>
                      <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Detalles</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <ProductImage
                              product={item}
                              alt={`Imagen de ${item.nombre}`}
                              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                            />
                          </td>
                          <td>{item.nombre}</td>
                          <td>{item.detalles}</td>
                          <td>{item.cantidad}</td>
                          <td>${Number(item.precioVenta).toFixed(2)}</td>
                          <td>${Number(item.subtotal).toFixed(2)}</td>
                          <td className="commerce-table__actions">
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="commerce-action-btn commerce-action-btn--plus"
                              onClick={() =>
                                editarItemCarrito(
                                  item.id,
                                  item.cantidad + 1,
                                  Number(item.subtotal) + Number(item.precioVenta)
                                )
                              }
                              disabled={item.cantidad >= item.inventario_cant}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>{" "}
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="commerce-action-btn commerce-action-btn--minus"
                              onClick={() =>
                                editarItemCarrito(
                                  item.id,
                                  item.cantidad - 1,
                                  item.subtotal - item.precioVenta
                                )
                              }
                              disabled={item.cantidad <= 1}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </Button>{" "}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="commerce-action-btn commerce-action-btn--delete"
                              onClick={() => eliminarItemCarrito(item.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              <Row>
                <Col md={8}>
                  <Card className="commerce-card mb-4">
                    <Card.Body className="commerce-card__body">
                      <h4 className="mb-3">Opciones de envio</h4>
                      <Form className="commerce-form">
                        <Form.Check
                          type="radio"
                          id="envio-estandar"
                          label="Envio estandar (3-5 dias habiles)"
                          name="opcionEnvio"
                          defaultChecked
                        />
                        <Form.Check
                          type="radio"
                          id="envio-express"
                          label="Envio express (1-2 dias habiles)"
                          name="opcionEnvio"
                        />
                      </Form>
                    </Card.Body>
                  </Card>

                  <Card className="commerce-card commerce-delivery-card mb-4">
                    <Card.Body className="commerce-card__body">
                      <div className="commerce-delivery-card__header">
                        <div>
                          <h4 className="mb-1">Direccion de entrega</h4>
                          <p>Confirmala antes de pagar. Estos datos se guardan con esta compra.</p>
                        </div>
                        <FontAwesomeIcon icon={faLocationDot} />
                      </div>

                      <Form className="commerce-delivery-form">
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3" controlId="deliveryNombre">
                              <Form.Label>Nombre de quien recibe</Form.Label>
                              <Form.Control
                                type="text"
                                value={deliveryAddress.nombre}
                                onChange={(event) => updateDeliveryField("nombre", event.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3" controlId="deliveryTelefono">
                              <Form.Label>Telefono</Form.Label>
                              <Form.Control
                                type="tel"
                                value={deliveryAddress.telefono}
                                onChange={(event) => updateDeliveryField("telefono", event.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group className="mb-3" controlId="deliveryCorreo">
                              <Form.Label>Correo</Form.Label>
                              <Form.Control
                                type="email"
                                value={deliveryAddress.correo}
                                onChange={(event) => updateDeliveryField("correo", event.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group className="mb-3" controlId="deliveryDomicilio">
                              <Form.Label>Calle y numero</Form.Label>
                              <Form.Control
                                type="text"
                                value={deliveryAddress.domicilio}
                                onChange={(event) => updateDeliveryField("domicilio", event.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={5}>
                            <Form.Group className="mb-3" controlId="deliveryCiudad">
                              <Form.Label>Ciudad</Form.Label>
                              <Form.Control
                                type="text"
                                value={deliveryAddress.ciudad}
                                onChange={(event) => updateDeliveryField("ciudad", event.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={5}>
                            <Form.Group className="mb-3" controlId="deliveryEstado">
                              <Form.Label>Estado</Form.Label>
                              <Form.Control
                                type="text"
                                value={deliveryAddress.estadoDireccion}
                                onChange={(event) => updateDeliveryField("estadoDireccion", event.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group className="mb-3" controlId="deliveryCodigoPostal">
                              <Form.Label>CP</Form.Label>
                              <Form.Control
                                type="text"
                                inputMode="numeric"
                                maxLength={10}
                                value={deliveryAddress.codigoPostal}
                                onChange={(event) => updateDeliveryField("codigoPostal", event.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group className="mb-3" controlId="deliveryReferencias">
                              <Form.Label>Referencias</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                maxLength={500}
                                value={deliveryAddress.referenciasDomicilio}
                                onChange={(event) => updateDeliveryField("referenciasDomicilio", event.target.value)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <div className="commerce-address-map">
                              <div className="commerce-address-map__bar">
                                <div>
                                  <strong>Punto de entrega</strong>
                                  <span>
                                    {deliveryAddress.latitud && deliveryAddress.longitud
                                      ? `${Number(deliveryAddress.latitud).toFixed(6)}, ${Number(deliveryAddress.longitud).toFixed(6)}`
                                      : "Sin ubicacion marcada"}
                                  </span>
                                </div>
                                <Button type="button" variant="outline-success" onClick={useCurrentLocation}>
                                  <FontAwesomeIcon icon={faLocationCrosshairs} />
                                  Usar mi ubicacion
                                </Button>
                              </div>
                              <BranchMap
                                selectedPosition={
                                  deliveryAddress.latitud && deliveryAddress.longitud
                                    ? { latitud: deliveryAddress.latitud, longitud: deliveryAddress.longitud }
                                    : null
                                }
                                onPickLocation={updateDeliveryLocation}
                                interactivePicker
                                className="branch-map--delivery"
                              />
                            </div>
                          </Col>
                        </Row>

                        <div className="commerce-delivery-form__actions">
                          <Button
                            type="button"
                            variant="outline-success"
                            onClick={restaurarDireccionPerfil}
                            disabled={!profileAddress}
                          >
                            <FontAwesomeIcon icon={faRotateLeft} />
                            Usar datos de mi perfil
                          </Button>
                          <Link to="/perfil" className="commerce-profile-link">
                            Actualizar perfil
                          </Link>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="commerce-card commerce-summary mb-4">
                    <Card.Body className="commerce-card__body">
                      <h4 className="mb-3">Resumen del pedido</h4>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>${quote?.subtotal || "0.00"}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>IVA (16%):</span>
                        <span>${quote?.iva || "0.00"}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Envio:</span>
                        <span>${quote?.envio || "0.00"}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <strong>${quote?.total || "0.00"}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="commerce-card mb-4">
                <Card.Body className="commerce-card__body">
                  <h4 className="mb-3">Metodo de pago</h4>
                  <div className="commerce-payment">
                    <Button variant="success" className="commerce-pay-button" disabled={submitting || !quote || Boolean(pending)} onClick={realizarPago}>
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                      Confirmar pedido en efectivo
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default CartView;
