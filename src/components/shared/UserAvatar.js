import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { buildApiUrl } from "../../config/api";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(imagePath)) {
    return imagePath;
  }

  return buildApiUrl(imagePath.startsWith("/") ? imagePath : `/${imagePath}`);
};

const UserAvatar = ({ imagePath, name = "Usuario", className = "", size = 40 }) => {
  const imageUrl = resolveImageUrl(imagePath);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <span className={`user-avatar ${className}`} style={{ width: size, height: size }}>
      {imageUrl && !hasImageError ? (
        <img
          src={imageUrl}
          alt={`Foto de ${name}`}
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <FontAwesomeIcon icon={faUser} />
      )}
    </span>
  );
};

export default UserAvatar;
