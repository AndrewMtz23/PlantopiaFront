import React, { useState, useEffect, useCallback } from "react";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faPlus, faMinus, faTrash, faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import { Alert, Button, Table, Form, Container, Card, Row, Col } from "react-bootstrap";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../css/Catalogo.css';
import Swal from "sweetalert2";
import { PayPalButton } from "react-paypal-button-v2";
import { generarFacturaPDF } from '../pdf/pdfCarrito';
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
  const sessionData = getSessionData();

  const obtenerCarrito = useCallback(async () => {
    try {
      const cartItems = await getCart(sessionData.idUsuario);
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
  }, [sessionData.idUsuario]);

  useEffect(() => {
    obtenerCarrito();
  }, [obtenerCarrito]);

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

  const realizarPago = async () => {
    try {
      const compraProcesada = await processPurchase(sessionData.idUsuario);
      const itemsComprados = compraProcesada.items || carrito;
      const totalCompra = compraProcesada.total || total;

      setCarrito([]);
      setTotal(0);

      const factura = await Swal.fire({
        title: "Deseas factura?",
        showCancelButton: true,
        confirmButtonText: "Si, generar factura",
        cancelButtonText: "No, continuar sin factura",
        reverseButtons: true,
        icon: "question",
      });

      if (factura.isConfirmed) {
        generarFacturaPDF(itemsComprados, totalCompra, detallesEmpresa);
      }

      Swal.fire("Pago exitoso", "Gracias por tu compra!", "success");
    } catch (paymentError) {
      console.error("Error al realizar el pago:", paymentError);
      setError(paymentError.response?.data?.error || "Error al realizar el pago");
    }
  };

  const detallesEmpresa = {
    nombre: "Plantopia",
    ubicacion: "Calle Ficticia #123, Ciudad Ficticia",
    correo: "info@plantopia.com.mx",
    telefono: "+1 (555) 123-4567",
  };

  const isUserLoggedIn = isAuthenticated(sessionData);

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
                    <Button variant="success" className="commerce-pay-button" onClick={realizarPago}>
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                      Pago en efectivo
                    </Button>
                  </div>
                  {pagarConPayPal && (
                    <div className="mt-3">
                      <PayPalButton
                        amount={(total * 1.16 + 50).toFixed(2)}
                        onSuccess={() => {
                          realizarPago();
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
