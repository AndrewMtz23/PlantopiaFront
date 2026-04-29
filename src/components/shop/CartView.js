import React, { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faMinus, faTrash, faCreditCard, faLocationDot, faRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import { Alert, Button, Table, Form, Container, Card, Row, Col } from "react-bootstrap";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../css/Catalogo.css';
import { PayPalButton } from "react-paypal-button-v2";
import Footer from '../decoraciones/footer';
import { getSessionData, isAuthenticated } from "../../utils/session";
import { deleteCartItem, getCart, processPurchase, updateCartItem } from "../../services/cartService";
import PublicHeader from "../shared/PublicHeader";
import ProductImage from "../shared/ProductImage";

const CartView = () => {
  const [carrito, setCarrito] = useState([]);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [pagarConPayPal, setPagarConPayPal] = useState(false);
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
  });
  const [profileAddress, setProfileAddress] = useState(null);
  const sessionData = getSessionData();
  const userId = sessionData?.idUsuario;
  const isUserLoggedIn = isAuthenticated(sessionData);
  const navigate = useNavigate();

  const obtenerCarrito = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const cartItems = await getCart(userId);
      setCarrito(cartItems);

      const totalCarrito = cartItems.reduce(
        (accumulator, item) => accumulator + item.subtotal,
        0
      );
      setTotal(totalCarrito);
    } catch (fetchError) {
      console.error("Error al obtener el carrito:", fetchError);
      setError("Error al obtener el carrito");
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
      deliveryAddress.codigoPostal.length < 5 ||
      deliveryAddress.codigoPostal.length > 10
    ) {
      return "El codigo postal de entrega debe tener entre 5 y 10 digitos.";
    }

    return null;
  };

  const restaurarDireccionPerfil = () => {
    if (profileAddress) {
      setDeliveryAddress(profileAddress);
    }
  };

  const realizarPago = async (method = "efectivo", reference = null) => {
    const addressError = validarDireccionEntrega();

    if (addressError) {
      setError(addressError);
      return;
    }

    try {
      const compraProcesada = await processPurchase(userId, {
        method,
        reference,
        deliveryAddress,
      });

      setCarrito([]);
      setTotal(0);
      navigate(`/compra-confirmada/${compraProcesada.pagoId}`, {
        replace: true,
      });
    } catch (paymentError) {
      console.error("Error al realizar el pago:", paymentError);
      setError(paymentError.response?.data?.error || "Error al realizar el pago");
    }
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
                          <td>${item.precioVenta.toFixed(2)}</td>
                          <td>${item.subtotal.toFixed(2)}</td>
                          <td className="commerce-table__actions">
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="commerce-action-btn commerce-action-btn--plus"
                              onClick={() =>
                                editarItemCarrito(
                                  item.id,
                                  item.cantidad + 1,
                                  item.subtotal + item.precioVenta
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
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>IVA (16%):</span>
                        <span>${(total * 0.16).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Envio:</span>
                        <span>$50.00</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <strong>${(total * 1.16 + 50).toFixed(2)}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="commerce-card mb-4">
                <Card.Body className="commerce-card__body">
                  <h4 className="mb-3">Metodo de pago</h4>
                  <div className="commerce-payment">
                    <Form.Check
                      type="checkbox"
                      label="Pagar con PayPal"
                      checked={pagarConPayPal}
                      onChange={() => setPagarConPayPal(!pagarConPayPal)}
                      className="mb-2"
                    />
                    <Button variant="success" className="commerce-pay-button" onClick={() => realizarPago("efectivo")}>
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                      Pago en efectivo
                    </Button>
                  </div>
                  {pagarConPayPal && (
                    <div className="mt-3">
                      <PayPalButton
                        amount={(total * 1.16 + 50).toFixed(2)}
                        onSuccess={(details) => {
                          realizarPago("paypal", details?.id || null);
                        }}
                        options={{
                          clientId: "AYGIIXFpMLje1XHelGGnPN0GATFi9PKbEeFHM96EdCU8jDs_MWaR5GjaamRC9aQ_zWqIu_flFgMVnuRC",
                          currency: "MXN",
                        }}
                      />
                    </div>
                  )}
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
