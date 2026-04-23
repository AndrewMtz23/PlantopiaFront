import React, { useEffect, useMemo, useState } from "react";
import { FALLBACK_PRODUCT_IMAGE, getProductImageCandidates } from "../../utils/productImages";

const ProductImage = ({ product, alt, ...imgProps }) => {
  const candidates = useMemo(() => getProductImageCandidates(product), [product]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  const currentSrc = candidates[candidateIndex] || FALLBACK_PRODUCT_IMAGE;

  return (
    <img
      {...imgProps}
      src={currentSrc}
      alt={alt}
      onError={() => {
        setCandidateIndex((current) =>
          current < candidates.length - 1 ? current + 1 : current
        );
      }}
    />
  );
};

export default ProductImage;
