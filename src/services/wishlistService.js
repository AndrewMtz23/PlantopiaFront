import Axios from "axios";

const getWishlistIds = async (userId) => {
  const response = await Axios.get(`/verAgregados/${userId}`);
  return response.data;
};

const getWishlist = async (userId) => {
  const response = await Axios.get(`/verLista/${userId}`);
  return response.data;
};

const addToWishlist = async ({ productId, userId }) => {
  const response = await Axios.post("/crearLista", {
    inventario: productId,
    usuario: userId,
  });

  return response.data;
};

const removeFromWishlist = async (wishlistItemId) => {
  const response = await Axios.delete(`/eliminarLista/${wishlistItemId}`);
  return response.data;
};

const removeInventoryFromWishlist = async ({ productId, userId }) => {
  const response = await Axios.delete(`/eliminarListaInventario/${userId}/${productId}`);
  return response.data;
};

export {
  addToWishlist,
  getWishlist,
  getWishlistIds,
  removeInventoryFromWishlist,
  removeFromWishlist,
};
