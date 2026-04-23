const FALLBACK_PRODUCT_IMAGE = "/fondo-macetas.webp";

const normalizeImageValue = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getProductImageCandidates = (product = {}) => {
  const localImage = normalizeImageValue(product.imagen || product.image);
  const remoteImage = normalizeImageValue(product.imagenUrl || product.imageUrl);

  return [localImage, remoteImage, FALLBACK_PRODUCT_IMAGE].filter(
    (value, index, list) => value && list.indexOf(value) === index
  );
};

const getPrimaryProductImage = (product = {}) =>
  getProductImageCandidates(product)[0] || FALLBACK_PRODUCT_IMAGE;

export {
  FALLBACK_PRODUCT_IMAGE,
  getPrimaryProductImage,
  getProductImageCandidates,
};
