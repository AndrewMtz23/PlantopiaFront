import "../../App.css";
import { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faChartPie,
  faDollarSign,
  faDownload,
  faEye,
  faFilter,
  faPenToSquare,
  faPlus,
  faRotateLeft,
  faSeedling,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { generarPDF } from "../pdf/pdfProductos";
import { apiFetch } from "../../config/api";
import AdminShell from "./AdminShell";
import ProductImage from "../shared/ProductImage";

const getStatusLabel = (estatus) =>
  Number(estatus) === 1 ? "Activo" : "Inactivo";

function Productos() {
  const [estatus, setEstatus] = useState(1);
  const [nombre, setNombre] = useState("");
  const [detalles, setDetalles] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenUrl, setImagenUrl] = useState("");
  const [id, setId] = useState();
  const [editar, setEditar] = useState(false);
  const [productosLista, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [campoBusqueda, setCampoBusqueda] = useState("global");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);

  const cerrarModal = () => {
    setMostrarModal(false);
    limpiarCampos();
  };

  const abrirNuevoProducto = () => {
    limpiarCampos();
    setMostrarModal(true);
  };

  const abrirDetalleProducto = (producto) => {
    setProductoDetalle(producto);
    setMostrarDetalle(true);
  };

  const cerrarDetalleProducto = () => {
    setProductoDetalle(null);
    setMostrarDetalle(false);
  };

  const add = () => {
    if (
      nombre.trim() === "" ||
      detalles.trim() === "" ||
      categoria.trim() === "" ||
      precioCompra.trim() === "" ||
      precioVenta.trim() === ""
    ) {
      Swal.fire({
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
        icon: "error",
      });
    } else if (parseFloat(precioCompra) > parseFloat(precioVenta)) {
      Swal.fire({
        title: "Error",
        text: "El precio de compra no puede ser mayor que el precio de venta.",
        icon: "error",
      });
    } else {
      Axios.post("/crearProducto", {
        estatus,
        nombre,
        detalles,
        categoria,
        precioCompra,
        precioVenta,
        imagen,
        imagenUrl,
      })
        .then(() => {
          getProductos();
          cerrarModal();
          Swal.fire({
            title: "Registro exitoso!",
            html: "Producto registrado con exito.",
            icon: "success",
          });
        })
        .catch((error) => {
          console.error(error);
          Swal.fire("Error", error?.response?.data?.error || "No se pudo crear el producto.", "error");
        });
    }
  };

  const update = () => {
    Axios.put("/editarProducto", {
      id,
      estatus,
      nombre,
      detalles,
      categoria,
      precioCompra,
      precioVenta,
      imagen,
      imagenUrl,
    })
      .then(() => {
        getProductos();
        cerrarModal();
        Swal.fire({
          title: "<strong>Actualizacion exitosa!</strong>",
          html: "<i>Producto fue actualizado con exito.</i>",
          icon: "success",
        });
      })
      .catch((error) => {
        console.error(error);
        Swal.fire("Error", error?.response?.data?.error || "No se pudo actualizar el producto.", "error");
      });
  };

  const deleteProducto = (productId) => {
    Swal.fire({
      title: "Desactivar producto",
      text: "Estas seguro de desactivar este producto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, desactivar",
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`/eliminarProducto/${productId}`)
          .then(() => {
            getProductos();
            limpiarCampos();
            Swal.fire("Producto inactivo", "El producto fue desactivado con exito.", "success");
          })
          .catch((error) => {
            console.error(error);
            Swal.fire(
              "Error!",
              error?.response?.data?.error ||
                "Hubo un problema al desactivar el producto.",
              "error"
            );
          });
      }
    });
  };

  const limpiarCampos = () => {
    setEstatus(1);
    setNombre("");
    setDetalles("");
    setCategoria("");
    setPrecioCompra("");
    setPrecioVenta("");
    setImagen(null);
    setImagenUrl("");
    setEditar(false);
    setId(undefined);
  };

  const editarProducto = (val) => {
    setEditar(true);
    setId(val.id);
    setEstatus(val.estatus);
    setNombre(val.nombre);
    setDetalles(val.detalles);
    setCategoria(val.categoria);
    setPrecioCompra(val.precioCompra);
    setPrecioVenta(val.precioVenta);
    setImagen(val.imagen);
    setImagenUrl(val.imagenUrl || "");
    setMostrarModal(true);
  };

  const getProductos = useCallback(() => {
    Axios.get("/verProducto").then((response) => {
      const productosFiltrados = response.data.filter((producto) => {
        switch (campoBusqueda) {
          case "global": {
            const idMatch = producto.id.toString().includes(busqueda);
            const productoMatch = producto.nombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const estatusMatch = getStatusLabel(producto.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const detallesMatch = producto.detalles
              .toString()
              .includes(busqueda);
            const categoriaMatch = producto.categoria
              .toString()
              .includes(busqueda);
            const precioCompraMatch = producto.precioCompra
              .toString()
              .includes(busqueda);
            const precioVentaMatch = producto.precioVenta
              .toString()
              .includes(busqueda);
            return (
              idMatch ||
              productoMatch ||
              estatusMatch ||
              detallesMatch ||
              categoriaMatch ||
              precioCompraMatch ||
              precioVentaMatch
            );
          }
          case "id":
            return Number(producto.id) === Number(busqueda);
          case "estatus":
            return getStatusLabel(producto.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "nombre":
            return producto.nombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "detalles":
          case "fecha":
            return producto.detalles
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "categoria":
            return producto.categoria
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "precioCompra":
            return producto.precioCompra
              .toString()
              .includes(busqueda);
          case "precioVenta":
            return producto.precioVenta
              .toString()
              .includes(busqueda);
          default:
            return false;
        }
      });
      setProductos(productosFiltrados);
    });
  }, [busqueda, campoBusqueda]);

  useEffect(() => {
    getProductos();
  }, [getProductos]);

  const generarPDFHandler = () => {
    Axios.get("/verProducto")
      .then((response) => {
        generarPDF(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error);
      });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      apiFetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          const contentType = response.headers.get("content-type") || "";
          const rawBody = await response.text();

          if (contentType.includes("application/json")) {
            try {
              const data = JSON.parse(rawBody);

              if (!response.ok) {
                throw new Error(data?.error || "No se pudo subir la imagen.");
              }

              return data;
            } catch (parseError) {
              if (!response.ok) {
                throw new Error(rawBody || "No se pudo subir la imagen.");
              }
            }
          }

          if (!response.ok) {
            throw new Error(rawBody || "No se pudo subir la imagen.");
          }

          return {
            ok: true,
            path: `/images/${file.name}`,
            legacyMessage: rawBody,
          };
        })
        .then((data) => {
          setImagen(data.path);
        })
        .catch((error) => {
          console.error(error);
          Swal.fire("Error", error.message || "No se pudo subir la imagen.", "error");
        });
    }
  };

  const totalProductos = productosLista.length;
  const activos = productosLista.filter((item) => Number(item.estatus) === 1).length;
  const inactivos = totalProductos - activos;
  const activePercentage = totalProductos
    ? Math.round((activos / totalProductos) * 100)
    : 0;
  const promedioVenta = totalProductos
    ? Math.round(
        productosLista.reduce(
          (acc, item) => acc + Number(item.precioVenta || 0),
          0
        ) / totalProductos
      )
    : 0;

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Administracion</span>
          <h1 className="admin-page-header__title">Gestion de productos</h1>
          <p className="admin-page-header__text">
            Organiza el catalogo con una vista compacta, carga de imagen y
            detalle completo sin perder el control del inventario visual.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button className="btn btn-success" onClick={abrirNuevoProducto}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nuevo producto
          </button>
          <button className="btn btn-secondary" onClick={generarPDFHandler}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Exportar PDF
          </button>
          <Link to="/cruds" className="btn btn-outline-success admin-page-header__ghost">
            <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
            Volver al panel
          </Link>
        </div>
      </section>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </span>
          <span className="admin-stat-card__label">Productos visibles</span>
          <strong className="admin-stat-card__value">{totalProductos}</strong>
          <span className="admin-stat-card__meta">Resultados del filtro actual</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faSeedling} />
          </span>
          <span className="admin-stat-card__label">Categorias activas</span>
          <strong className="admin-stat-card__value">
            {new Set(productosLista.map((item) => item.categoria)).size}
          </strong>
          <span className="admin-stat-card__meta">Tipos de producto listados</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </span>
          <span className="admin-stat-card__label">Precio venta prom.</span>
          <strong className="admin-stat-card__value">${promedioVenta}</strong>
          <span className="admin-stat-card__meta">Promedio del filtro actual</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faChartPie} />
          </span>
          <span className="admin-stat-card__label">Estado</span>
          <strong className="admin-stat-card__value">{activePercentage}%</strong>
          <span className="admin-stat-card__meta">Productos activos del total</span>
        </article>
      </section>

      <section className="admin-panel-grid admin-panel-grid--users">
        <aside className="admin-side-card">
          <span className="admin-side-card__eyebrow">Visibilidad</span>
          <h3 className="admin-side-card__title">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Busqueda y filtro
          </h3>
          <p className="admin-side-card__text">
            Encuentra productos por nombre, categoria o rango de precios y abre
            su ficha completa sin saturar la tabla.
          </p>

          <div className="admin-side-card__controls">
            <label className="admin-field">
              <span className="admin-field__label">Buscar por</span>
              <select
                value={campoBusqueda}
                onChange={(event) => setCampoBusqueda(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="global">Global</option>
                <option value="id">Id</option>
                <option value="estatus">Estatus</option>
                <option value="nombre">Nombre</option>
                <option value="detalles">Detalles</option>
                <option value="categoria">Categoria</option>
                <option value="precioCompra">Compra</option>
                <option value="precioVenta">Venta</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Termino</span>
              <input
                type="text"
                name="admin-product-search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                className="form-control admin-field__control"
                placeholder={`Buscar por ${campoBusqueda}`}
                autoComplete="off"
              />
            </label>
          </div>

          <div className="admin-status-chart">
            <div
              className="admin-status-chart__ring"
              style={{
                background: `conic-gradient(#22b573 0 ${activePercentage}%, rgba(255,255,255,0.18) ${activePercentage}% 100%)`,
              }}
            >
              <div className="admin-status-chart__ring-center">
                <strong>{activePercentage}%</strong>
                <span>activos</span>
              </div>
            </div>

            <div className="admin-status-chart__legend">
              <div className="admin-status-chart__legend-item">
                <span className="admin-status-chart__dot admin-status-chart__dot--active" />
                <span>Activos</span>
                <strong>{activos}</strong>
              </div>
              <div className="admin-status-chart__legend-item">
                <span className="admin-status-chart__dot admin-status-chart__dot--inactive" />
                <span>Inactivos</span>
                <strong>{inactivos}</strong>
              </div>
            </div>
          </div>
        </aside>

        <section className="admin-table-card">
          <div className="admin-table-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Listado</span>
              <h2 className="admin-table-card__title">
                <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                Productos registrados
              </h2>
            </div>
            <span className="admin-table-card__count">{totalProductos} resultados</span>
          </div>

          <div className="admin-table-wrap">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Estatus</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Categoria</th>
                  <th scope="col">Venta</th>
                  <th scope="col">Imagen</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosLista.map((val) => (
                  <tr key={val.id}>
                    <th>{val.id}</th>
                    <td>
                      <span
                        className={`admin-status-pill admin-status-pill--${
                          Number(val.estatus) === 1 ? "active" : "inactive"
                        }`}
                      >
                        {getStatusLabel(val.estatus)}
                      </span>
                    </td>
                    <td>{val.nombre}</td>
                    <td>{val.categoria}</td>
                    <td>${val.precioVenta}</td>
                    <td>
                      <ProductImage
                        product={val}
                        alt="Imagen del Producto"
                        width="40"
                        height="40"
                        style={{ objectFit: "cover", borderRadius: "10px" }}
                      />
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          onClick={() => abrirDetalleProducto(val)}
                          className="btn btn-light admin-icon-button"
                          aria-label={`Visualizar datos de ${val.nombre}`}
                          title="Visualizar datos"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          type="button"
                          onClick={() => editarProducto(val)}
                          className="btn btn-info admin-icon-button"
                          aria-label={`Editar ${val.nombre}`}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProducto(val.id)}
                          className="btn btn-danger admin-icon-button"
                          aria-label={`Desactivar ${val.nombre}`}
                          title="Desactivar"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-mobile-list">
            {productosLista.map((val) => (
              <article key={val.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <span className="admin-mobile-card__eyebrow">Producto #{val.id}</span>
                    <h3 className="admin-mobile-card__title">{val.nombre}</h3>
                  </div>
                  <span
                    className={`admin-status-pill admin-status-pill--${
                      Number(val.estatus) === 1 ? "active" : "inactive"
                    }`}
                  >
                    {getStatusLabel(val.estatus)}
                  </span>
                </div>

                <div className="admin-mobile-card__grid">
                  <div className="admin-mobile-card__item">
                    <span className="admin-mobile-card__label">Categoria</span>
                    <strong>{val.categoria}</strong>
                  </div>
                  <div className="admin-mobile-card__item">
                    <span className="admin-mobile-card__label">Precio venta</span>
                    <strong>${val.precioVenta}</strong>
                  </div>
                  <div className="admin-mobile-card__item admin-mobile-card__item--wide">
                    <span className="admin-mobile-card__label">Detalle</span>
                    <strong>{val.detalles}</strong>
                  </div>
                </div>

                <div className="admin-mobile-card__actions">
                  <button
                    type="button"
                    onClick={() => abrirDetalleProducto(val)}
                    className="btn btn-light admin-icon-button"
                    aria-label={`Visualizar datos de ${val.nombre}`}
                    title="Visualizar datos"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    type="button"
                    onClick={() => editarProducto(val)}
                    className="btn btn-info admin-icon-button"
                    aria-label={`Editar ${val.nombre}`}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProducto(val.id)}
                    className="btn btn-danger admin-icon-button"
                    aria-label={`Desactivar ${val.nombre}`}
                    title="Desactivar"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <Modal
        show={mostrarModal}
        onHide={cerrarModal}
        centered
        size="lg"
        dialogClassName="admin-modal"
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">
              {editar ? "Modo edicion" : "Nuevo registro"}
            </span>
            <Modal.Title className="admin-modal__title">
              {editar ? "Actualizar producto" : "Crear producto"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          <div className="admin-form-grid">
            <label className="admin-field">
              <span className="admin-field__label">Estatus</span>
              <select
                value={estatus}
                onChange={(event) => setEstatus(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Categoria</span>
              <select
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="">Selecciona la categoria</option>
                <option value="Desinfectantes">Desinfectantes</option>
                <option value="Plantas de Interior">Plantas de Interior</option>
                <option value="Plantas de Exterior">Plantas de Exterior</option>
                <option value="Productos para Plantas">Productos para Plantas</option>
                <option value="Productos especializados">Productos especializados</option>
                <option value="Plantas Jardineria">Plantas Jardineria</option>
                <option value="Productos Jardineria">Productos Jardineria</option>
              </select>
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Nombre</span>
              <input
                type="text"
                name="admin-product-name"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Nombre del producto"
                autoComplete="off"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Detalles</span>
              <input
                type="text"
                name="admin-product-details"
                value={detalles}
                onChange={(event) => setDetalles(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Descripcion corta"
                autoComplete="off"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Precio de compra</span>
              <input
                type="number"
                name="admin-product-purchase-price"
                value={precioCompra}
                onChange={(event) => setPrecioCompra(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Costo"
                min="0"
                step="0.01"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Precio de venta</span>
              <input
                type="number"
                name="admin-product-sale-price"
                value={precioVenta}
                onChange={(event) => setPrecioVenta(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Venta"
                min="0"
                step="0.01"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Imagen</span>
              <input
                type="file"
                name="admin-product-image"
                onChange={handleImageChange}
                className="form-control admin-field__control"
                accept=".jpg,.jpeg,.png,.webp,.gif"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">URL de respaldo</span>
              <input
                type="url"
                name="admin-product-image-url"
                value={imagenUrl}
                onChange={(event) => setImagenUrl(event.target.value)}
                className="form-control admin-field__control"
                placeholder="https://sitio.com/imagen-del-producto.jpg"
                autoComplete="url"
              />
            </label>

            {(imagen || imagenUrl) ? (
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Vista previa</span>
                <ProductImage
                  product={{ imagen, imagenUrl, nombre }}
                  alt={nombre || "Vista previa del producto"}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "18px",
                    marginTop: "0.5rem",
                  }}
                />
              </div>
            ) : null}
          </div>
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          {editar ? (
            <>
              <button className="btn btn-warning" onClick={update}>
                <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                Actualizar producto
              </button>
              <button className="btn btn-danger" onClick={cerrarModal}>
                <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-success" onClick={add}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Crear producto
              </button>
              <button className="btn admin-page-header__ghost" onClick={cerrarModal}>
                <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
                Cerrar
              </button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal
        show={mostrarDetalle}
        onHide={cerrarDetalleProducto}
        centered
        dialogClassName="admin-modal admin-modal--details"
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">Vista detallada</span>
            <Modal.Title className="admin-modal__title">
              {productoDetalle?.nombre || "Producto"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          {productoDetalle && (
            <div className="admin-detail-grid">
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">ID</span>
                <strong>{productoDetalle.id}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Estatus</span>
                <strong>{getStatusLabel(productoDetalle.estatus)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Categoria</span>
                <strong>{productoDetalle.categoria}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Nombre</span>
                <strong>{productoDetalle.nombre}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Compra</span>
                <strong>${productoDetalle.precioCompra}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Venta</span>
                <strong>${productoDetalle.precioVenta}</strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Detalles</span>
                <strong>{productoDetalle.detalles}</strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Imagen</span>
                {productoDetalle.imagen || productoDetalle.imagenUrl ? (
                  <ProductImage
                    product={productoDetalle}
                    alt="Imagen del Producto"
                    width="96"
                    height="96"
                    style={{ objectFit: "cover", borderRadius: "16px" }}
                  />
                ) : (
                  <strong>Sin imagen</strong>
                )}
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">URL de respaldo</span>
                <strong>{productoDetalle.imagenUrl || "Sin URL configurada"}</strong>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          <button className="btn admin-page-header__ghost" onClick={cerrarDetalleProducto}>
            <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </AdminShell>
  );
}

export default Productos;
