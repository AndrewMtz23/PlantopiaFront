import Axios from "axios";

const getCart = async (userId) => {
  const response = await Axios.get(`/verCarrito/${userId}`);
  return response.data;
};

const createCartItem = async ({ inventoryId, quantity }) => {
  const response = await Axios.post("/crearCarrito", {
    inventario: inventoryId,
    cantidad: quantity,
  });

  return response.data;
};

const updateCartItem = async ({ id, quantity }) => {
  const response = await Axios.put("/editarCarrito", {
    id,
    cantidad: quantity,
  });

  return response.data;
};

const deleteCartItem = async (cartItemId) => {
  const response = await Axios.delete(`/eliminarCarrito/${cartItemId}`);
  return response.data;
};

const addProductToCart = async ({ product, quantity, userId }) => {
  const cart = await getCart(userId);
  const existingItem = cart.find((item) => item.inventario_id === product.id);

  if (existingItem) {
    const nextQuantity = existingItem.cantidad + quantity;

    if (nextQuantity > product.cantidad) {
      throw new Error(
        "La cantidad ingresada supera la cantidad disponible del producto en el carrito."
      );
    }

    await updateCartItem({
      id: existingItem.id,
      quantity: nextQuantity,
      subtotal: nextQuantity * product.precioVenta,
    });

    return { action: "updated" };
  }

  await createCartItem({
    inventoryId: product.id,
    userId,
    quantity,
    subtotal: quantity * product.precioVenta,
  });

  return { action: "created" };
};

const getQuote = async () => (await Axios.get('/carrito/cotizacion')).data;
const pendingKey = userId => 'plantopia.pendingPurchase.' + userId;
const getPendingPurchase = userId => {
  try { return JSON.parse(sessionStorage.getItem(pendingKey(userId))); } catch { return null; }
};
const processPurchase = async (userId, { quoteHash, deliveryAddress } = {}) => {
  let pending = getPendingPurchase(userId);
  if (!pending) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    pending = { key: Array.from(bytes, n => n.toString(16).padStart(2, '0')).join(''), payload: { metodo: 'efectivo', quoteHash, direccionEntrega: deliveryAddress } };
    sessionStorage.setItem(pendingKey(userId), JSON.stringify(pending));
  }
  try {
    const response = await Axios.post('/procesarCompra', pending.payload, { headers: { 'Idempotency-Key': pending.key } });
    sessionStorage.removeItem(pendingKey(userId));
    return response.data;
  } catch (error) {
    if ([400, 403, 404, 409].includes(error.response?.status)) sessionStorage.removeItem(pendingKey(userId));
    throw error;
  }
};

export {
  getQuote, getPendingPurchase,
  addProductToCart,
  createCartItem,
  deleteCartItem,
  getCart,
  processPurchase,
  updateCartItem,
};
