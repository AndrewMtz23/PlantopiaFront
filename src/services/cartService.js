import Axios from "axios";

const getCart = async (userId) => {
  const response = await Axios.get(`/verCarrito/${userId}`);
  return response.data;
};

const createCartItem = async ({ inventoryId, userId, quantity, subtotal }) => {
  const response = await Axios.post("/crearCarrito", {
    inventario: inventoryId,
    usuario: userId,
    cantidad: quantity,
    subtotal,
  });

  return response.data;
};

const updateCartItem = async ({ id, quantity, subtotal }) => {
  const response = await Axios.put("/editarCarrito", {
    id,
    cantidad: quantity,
    subtotal,
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

const processPurchase = async (userId) => {
  const response = await Axios.post("/procesarCompra", {
    usuario: userId,
  });

  return response.data;
};

export {
  addProductToCart,
  createCartItem,
  deleteCartItem,
  getCart,
  processPurchase,
  updateCartItem,
};
