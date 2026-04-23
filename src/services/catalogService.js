import Axios from "axios";

const getProducts = async () => {
  const response = await Axios.get("/obtenerProductos");
  return response.data;
};

const getBranches = async () => {
  const response = await Axios.get("/verSucursal");
  return response.data;
};

export { getBranches, getProducts };
