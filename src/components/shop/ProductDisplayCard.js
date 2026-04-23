import React from "react";
import PlantopiaProductCard from "./PlantopiaProductCard";

const ProductDisplayCard = ({ producto, children }) => {
  return (
    <PlantopiaProductCard product={producto} badge={producto.categoria} variant="catalog">
      {children}
    </PlantopiaProductCard>
  );
};

export default ProductDisplayCard;
