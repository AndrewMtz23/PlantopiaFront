import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faMagnifyingGlass,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { Pagination, Alert } from "react-bootstrap";
import "../css/Catalogo.css";
import Swal from "sweetalert2";
import Footer from "../decoraciones/footer";
import { getSessionData } from "../../utils/session";
import { getBranches, getProducts } from "../../services/catalogService";
import { addProductToCart } from "../../services/cartService";
import { addToWishlist, getWishlistIds, removeFromWishlist } from "../../services/wishlistService";
import RequireAuth from "../shared/RequireAuth";
import PublicHeader from "../shared/PublicHeader";
import StoreHero from "./StoreHero";
import ProductImage from "../shared/ProductImage";

const CatalogProductCard = ({ producto }) => {
  const [cantidad, setCantidad] = useState(1);
  const [isEnLista, setIsEnLista] = useState(false);
  const [isAgregadoAlCarrito, setIsAgregadoAlCarrito] = useState(false);
  const sessionData = getSessionData();

  useEffect(() => {
    getWishlistIds(sessionData.idUsuario)
      .then((wishlistIds) => {
        setIsEnLista(wishlistIds.includes(producto.id));
      })
      .catch((error) => {
        console.error("Error al obtener productos en lista:", error);
      });
  }, [producto.id, sessionData.idUsuario]);

  useEffect(() => {
    setIsAgregadoAlCarrito(false);
  }, [cantidad, producto.id]);

  const handleCantidadChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= producto.cantidad) {
      setCantidad(value);
    }
  };

  const handleWishlistClick = async () => {
    try {
      if (isEnLista) {
        await removeFromWishlist(producto.id);
        setIsEnLista(false);
        return;
      }

      await addToWishlist({
        productId: producto.id,
        userId: sessionData.idUsuario,
      });
      setIsEnLista(true);
    } catch (error) {
      console.error("Error al actualizar la lista:", error);
    }
  };

  const handleAddToCart = async () => {
    const quantity = parseInt(cantidad, 10);

    if (isNaN(quantity) || quantity <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La cantidad ingresada no es valida.",
      });
      return;
    }

    if (quantity > producto.cantidad) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La cantidad ingresada supera la cantidad disponible del producto.",
      });
      return;
    }

    try {
      const { action } = await addProductToCart({
        product: producto,
        quantity,
        userId: sessionData.idUsuario,
      });

      setIsAgregadoAlCarrito(true);

      Swal.fire({
        icon: "success",
        title: "Exito",
        text:
          action === "updated"
            ? "El producto se ha actualizado en el carrito."
            : "El producto se ha agregado al carrito.",
      });
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo agregar el producto al carrito.",
      });
    }
  };

  return (
      <div className="b2b-card">
        <div className="b2b-card-image">
        <ProductImage product={producto} alt={producto.nombre} />
        <button 
          className={`b2b-wishlist-btn ${isEnLista ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isEnLista ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
      </div>
      <div className="b2b-card-body">
        <h3 className="b2b-card-title">{producto.nombre}</h3>
        <div className="b2b-card-id">{producto.categoria}</div>
        
        <div className="b2b-card-meta">
          <span className="b2b-badge">En stock</span>
        </div>
        
        <div className="b2b-card-price">
          ${parseFloat(producto.precioVenta).toFixed(2)} <small>MXN</small>
        </div>
        
        <div className="b2b-card-actions">
          <input 
            type="number" 
            min="1" 
            max={producto.cantidad} 
            value={cantidad} 
            onChange={handleCantidadChange} 
          />
          <button 
            className="b2b-btn" 
            onClick={handleAddToCart} 
            disabled={isAgregadoAlCarrito}
          >
            <FontAwesomeIcon icon={faShoppingCart} /> {isAgregadoAlCarrito ? "Agregado" : "+ Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CatalogView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState("Todas");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Derivar categorias unicas de los productos
  const categoriasDisponibles = useMemo(() => {
    const cats = new Set(productos.map(p => p.categoria));
    return Array.from(cats).filter(Boolean).sort();
  }, [productos]);

  useEffect(() => {
    getProducts()
      .then((products) => {
        setProductos(products);
        setFilteredProducts(products);
      })
      .catch((fetchError) => {
        setError("Hubo un error al obtener los productos.");
        console.error(fetchError);
      });

    getBranches()
      .then((branches) => {
        setSucursalesDisponibles(branches);
      })
      .catch((fetchError) => {
        console.error(fetchError);
      });
  }, []);

  useEffect(() => {
    let results = productos;

    if (searchTerm) {
      results = results.filter((producto) =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.detalles.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoriaSeleccionada !== "Todas") {
      results = results.filter((producto) => producto.categoria === categoriaSeleccionada);
    }

    if (sucursalSeleccionada !== "Todas") {
      results = results.filter((producto) => producto.sucursal === parseInt(sucursalSeleccionada, 10));
    }

    setFilteredProducts(results);
    setCurrentPage(1);
  }, [searchTerm, categoriaSeleccionada, sucursalSeleccionada, productos]);

  const handleSearch = (event) => {
    event.preventDefault();
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const getSucursalCount = (sucId) => {
      if (sucId === "Todas") return productos.length;
      return productos.filter(p => p.sucursal === sucId).length;
  };

  const getCategoriaCount = (catName) => {
      if (catName === "Todas") return productos.length;
      return productos.filter(p => p.categoria === catName).length;
  };

  const images = [
    "hojas-pequenas.webp",
    "hojas.webp",
    "plantas-endemicas.webp",
    "flores-pixels.webp",
  ];

  return (
    <RequireAuth>
      <div className="b2b-store-page">
        <PublicHeader />
        
        <StoreHero
          images={images}
          eyebrow="Catálogo online"
          title="Nuestra selección premium"
          description="Filtra por categoría o sucursal y arma tu pedido con nuestras mejores piezas orgánicas."
        />

        <div className="b2b-main mt-4">
          
          <aside className="b2b-sidebar">
            <div className="b2b-sidebar-card">
              <h3>Directorio</h3>
              <ul className="b2b-filter-list">
                <li 
                  className={`b2b-filter-item ${categoriaSeleccionada === "Todas" ? "active" : ""}`}
                  onClick={() => setCategoriaSeleccionada("Todas")}
                >
                  <span>Ver catalogo completo</span>
                  <span className="b2b-filter-count">{getCategoriaCount("Todas")}</span>
                </li>
              </ul>
            </div>

            <div className="b2b-sidebar-card">
              <h3>Categoría</h3>
              <ul className="b2b-filter-list">
                {categoriasDisponibles.map(cat => (
                  <li 
                    key={cat}
                    className={`b2b-filter-item ${categoriaSeleccionada === cat ? "active" : ""}`}
                    onClick={() => setCategoriaSeleccionada(cat)}
                  >
                    <span>{cat}</span>
                    <span className="b2b-filter-count">{getCategoriaCount(cat)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="b2b-sidebar-card">
              <h3>Disponibilidad</h3>
              <ul className="b2b-filter-list">
                <li 
                  className={`b2b-filter-item ${sucursalSeleccionada === "Todas" ? "active" : ""}`}
                  onClick={() => setSucursalSeleccionada("Todas")}
                >
                  <span>Cualquier Sucursal</span>
                  <span className="b2b-filter-count">{getSucursalCount("Todas")}</span>
                </li>
                {sucursalesDisponibles.map(suc => (
                  <li 
                    key={suc.id}
                    className={`b2b-filter-item ${sucursalSeleccionada === String(suc.id) ? "active" : ""}`}
                    onClick={() => setSucursalSeleccionada(String(suc.id))}
                  >
                    <span>{suc.nombre}</span>
                    <span className="b2b-filter-count">{getSucursalCount(suc.id)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="b2b-content">
            <div className="b2b-topbar">
              <h2 className="b2b-topbar-title">Catalog</h2>
              
              <div className="b2b-search-wrap">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input 
                  type="text" 
                  placeholder="Busca por nombre o detalle..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <>
                <div className="b2b-grid">
                  {currentProducts.map((producto) => (
                    <CatalogProductCard key={producto.id} producto={producto} />
                  ))}
                </div>

                {filteredProducts.length > productsPerPage && (
                  <div className="store-pagination d-flex justify-content-center mt-5 mb-4">
                    <Pagination>
                      {[...Array(Math.ceil(filteredProducts.length / productsPerPage))].map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentPage}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                    </Pagination>
                  </div>
                )}
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    No se encontraron productos con los filtros seleccionados.
                  </div>
                )}
              </>
            )}
          </main>
          
        </div>
        
        <Footer />
      </div>
    </RequireAuth>
  );
};

export default CatalogView;
