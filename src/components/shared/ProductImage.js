import React, { useEffect, useMemo, useState } from "react";
import { FALLBACK_PRODUCT_IMAGE, getProductImageCandidates } from "../../utils/productImages";
import { buildApiUrl } from "../../config/api";

const resolveProductImageUrl = (src = "") => {
  if (!src || /^https?:\/\//i.test(src)) {
    return src;
  }

  if (src.startsWith("/uploads/") || src.startsWith("/images/")) {
    return buildApiUrl(src);
  }

  return src;
};

const ProductImage = ({ product, alt, ...imgProps }) => {
  const candidates = useMemo(() => getProductImageCandidates(product), [product]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  const currentSrc = resolveProductImageUrl(candidates[candidateIndex] || FALLBACK_PRODUCT_IMAGE);

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
