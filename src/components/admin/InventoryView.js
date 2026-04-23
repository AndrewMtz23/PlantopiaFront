import "../../App.css";
import { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faBuilding,
  faChartPie,
  faDownload,
  faEye,
  faFilter,
  faLayerGroup,
  faPenToSquare,
  faPlus,
  faRotateLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import AdminShell from "./AdminShell";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const getStatusLabel = (estatus) =>
  Number(estatus) === 1 ? "Activo" : "Inactivo";

function Inventarios() {
  const [estatus, setEstatus] = useState(1);
  const [sucursal, setSucursal] = useState("");
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState([]);
  const [producto, setProducto] = useState("");
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [cantidad, setCantidad] = useState("");
  const [id, setId] = useState();
  const [editar, setEditar] = useState(false);
  const [inventariosLista, setInventarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [campoBusqueda, setCampoBusqueda] = useState("global");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [inventarioDetalle, setInventarioDetalle] = useState(null);

  const getSucursalNombre = useCallback(
    (sucursalId) =>
      sucursalesDisponibles.find((item) => Number(item.id) === Number(sucursalId))
        ?.nombre || `Sucursal ${sucursalId}`,
    [sucursalesDisponibles]
  );

  const getProveedorNombre = useCallback(
    (proveedorId) =>
      proveedoresDisponibles.find((item) => Number(item.id) === Number(proveedorId))
        ?.marca || `Proveedor ${proveedorId}`,
    [proveedoresDisponibles]
  );

  const getProductoNombre = useCallback(
    (productoId) =>
      productosDisponibles.find((item) => Number(item.id) === Number(productoId))
        ?.nombre || `Producto ${productoId}`,
    [productosDisponibles]
  );

  const cerrarModal = () => {
    setMostrarModal(false);
    limpiarCampos();
  };

  const abrirNuevoInventario = () => {
    limpiarCampos();
    setMostrarModal(true);
  };

  const abrirDetalleInventario = (inventario) => {
    setInventarioDetalle(inventario);
    setMostrarDetalle(true);
  };

  const cerrarDetalleInventario = () => {
    setInventarioDetalle(null);
    setMostrarDetalle(false);
  };

  const add = () => {
    if (
      sucursal.trim() === "" ||
      proveedor.trim() === "" ||
      producto.trim() === "" ||
      cantidad.trim() === ""
    ) {
      Swal.fire({
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
        icon: "error",
      });
    } else {
      Axios.post("/crearInventario", {
        estatus,
        sucursal,
        proveedor,
        producto,
        cantidad,
      }).then(() => {
        getInventarios();
        cerrarModal();
        Swal.fire({
          title: "Registro exitoso!",
          html: "Inventario registrado con exito.",
          icon: "success",
        });
      });
    }
  };

  const update = () => {
    Axios.put("/editarInventario", {
      id,
      estatus,
      sucursal,
      proveedor,
      producto,
      cantidad,
    }).then(() => {
      getInventarios();
      cerrarModal();
      Swal.fire({
        title: "<strong>Actualizacion exitosa!</strong>",
        html: "<i>Inventario fue actualizado con exito.</i>",
        icon: "success",
      });
    });
  };

  const deleteInventario = (inventoryId) => {
    Swal.fire({
      title: "Eliminacion",
      text: "Estas seguro de eliminar este inventario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`/eliminarInventario/${inventoryId}`)
          .then(() => {
            getInventarios();
            limpiarCampos();
            Swal.fire(
              "Eliminado",
              "Inventario eliminado con exito.",
              "success"
            );
          })
          .catch((error) => {
            console.error(error);
            Swal.fire(
              "Error!",
              "Hubo un problema al realizar la eliminacion del inventario.",
              "error"
            );
          });
      }
    });
  };

  const limpiarCampos = () => {
    setEstatus(1);
    setSucursal("");
    setProveedor("");
    setProducto("");
    setCantidad("");
    setEditar(false);
    setId(undefined);
  };

  const editarInventario = (val) => {
    setEditar(true);
    setId(val.id);
    setEstatus(val.estatus);
    setSucursal(val.sucursal);
    setProveedor(val.proveedor);
    setProducto(val.producto);
    setCantidad(val.cantidad);
    setMostrarModal(true);
  };

  const getInventarios = useCallback(() => {
    Axios.get("/verInventario").then((response) => {
      const inventariosFiltrados = response.data.filter((inventario) => {
        const sucursalNombre = getSucursalNombre(inventario.sucursal);
        const proveedorNombre = getProveedorNombre(inventario.proveedor);
        const productoNombre = getProductoNombre(inventario.producto);

        switch (campoBusqueda) {
          case "global": {
            const idMatch = inventario.id.toString().includes(busqueda);
            const proveedorMatch = proveedorNombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const sucursalMatch = sucursalNombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const estatusMatch = getStatusLabel(inventario.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const productoMatch = productoNombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const cantidadMatch = inventario.cantidad
              .toString()
              .includes(busqueda);
            return (
              idMatch ||
              proveedorMatch ||
              sucursalMatch ||
              estatusMatch ||
              productoMatch ||
              cantidadMatch
            );
          }
          case "id":
            return Number(inventario.id) === Number(busqueda);
          case "estatus":
            return getStatusLabel(inventario.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "sucursal":
            return sucursalNombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "proveedor":
            return proveedorNombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "producto":
            return productoNombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "cantidad":
            return inventario.cantidad.toString().includes(busqueda);
          default:
            return false;
        }
      });
      setInventarios(inventariosFiltrados);
    });
  }, [busqueda, campoBusqueda, getProductoNombre, getProveedorNombre, getSucursalNombre]);

  useEffect(() => {
    getInventarios();
  }, [getInventarios]);

  const getSucursalesDisponibles = useCallback(() => {
    Axios.get("/verSucursal")
      .then((response) => {
        setSucursalesDisponibles(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    getSucursalesDisponibles();
  }, [getSucursalesDisponibles]);

  const getProveedoresDisponibles = useCallback(() => {
    Axios.get("/verProveedor")
      .then((response) => {
        setProveedoresDisponibles(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    getProveedoresDisponibles();
  }, [getProveedoresDisponibles]);

  const getProductosDisponibles = useCallback(() => {
    Axios.get("/verProducto")
      .then((response) => {
        setProductosDisponibles(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    getProductosDisponibles();
  }, [getProductosDisponibles]);

  const generarPDF = () => {
    Axios.get("/verInventario")
      .then((response) => {
        const inventariosPDF = response.data.map((inventario) => [
          inventario.id,
          getStatusLabel(inventario.estatus),
          getSucursalNombre(inventario.sucursal),
          getProveedorNombre(inventario.proveedor),
          getProductoNombre(inventario.producto),
          inventario.cantidad,
        ]);

        const docDefinition = {
          content: [
            { text: "Informe de inventarios", style: "header" },
            {
              table: {
                headerRows: 1,
                widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
                body: [
                  [
                    "#",
                    "Estatus",
                    "Sucursal",
                    "Proveedor",
                    "Producto",
                    "Cantidad",
                  ],
                  ...inventariosPDF,
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              alignment: "center",
              margin: [0, 0, 0, 10],
            },
          },
        };

        pdfMake.createPdf(docDefinition).open();
      })
      .catch((error) => {
        console.error("Error al obtener inventarios:", error);
      });
  };

  const totalInventarios = inventariosLista.length;
  const activos = inventariosLista.filter((item) => Number(item.estatus) === 1).length;
  const inactivos = totalInventarios - activos;
  const activePercentage = totalInventarios
    ? Math.round((activos / totalInventarios) * 100)
    : 0;
  const totalUnidades = inventariosLista.reduce(
    (acc, item) => acc + Number(item.cantidad || 0),
    0
  );

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Administracion</span>
          <h1 className="admin-page-header__title">Gestion de inventarios</h1>
          <p className="admin-page-header__text">
            Visualiza existencias con nombres reales de sucursal, proveedor y
            producto para que el modulo se lea como dashboard y no como tabla
            tecnica.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button className="btn btn-success" onClick={abrirNuevoInventario}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nuevo inventario
          </button>
          <button className="btn btn-secondary" onClick={generarPDF}>
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
            <FontAwesomeIcon icon={faBoxesStacked} />
          </span>
          <span className="admin-stat-card__label">Registros visibles</span>
          <strong className="admin-stat-card__value">{totalInventarios}</strong>
          <span className="admin-stat-card__meta">Resultados del filtro actual</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faLayerGroup} />
          </span>
          <span className="admin-stat-card__label">Unidades totales</span>
          <strong className="admin-stat-card__value">{totalUnidades}</strong>
          <span className="admin-stat-card__meta">Suma del inventario visible</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faBuilding} />
          </span>
          <span className="admin-stat-card__label">Sucursales activas</span>
          <strong className="admin-stat-card__value">
            {new Set(inventariosLista.map((item) => item.sucursal)).size}
          </strong>
          <span className="admin-stat-card__meta">Sedes con inventario listado</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faChartPie} />
          </span>
          <span className="admin-stat-card__label">Estado</span>
          <strong className="admin-stat-card__value">{activePercentage}%</strong>
          <span className="admin-stat-card__meta">Inventarios activos del total</span>
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
            Busca por sucursal, proveedor o producto con nombres reales para
            encontrar movimientos mas rapido y sin depender de IDs.
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
                <option value="sucursal">Sucursal</option>
                <option value="proveedor">Proveedor</option>
                <option value="producto">Producto</option>
                <option value="cantidad">Cantidad</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Termino</span>
              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                className="form-control admin-field__control"
                placeholder={`Buscar por ${campoBusqueda}`}
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
                <FontAwesomeIcon icon={faBoxesStacked} className="me-2" />
                Inventarios registrados
              </h2>
            </div>
            <span className="admin-table-card__count">{totalInventarios} resultados</span>
          </div>

          <div className="admin-table-wrap">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Estatus</th>
                  <th scope="col">Sucursal</th>
                  <th scope="col">Proveedor</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventariosLista.map((val) => (
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
                    <td>{getSucursalNombre(val.sucursal)}</td>
                    <td>{getProveedorNombre(val.proveedor)}</td>
                    <td>{getProductoNombre(val.producto)}</td>
                    <td>{val.cantidad}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          onClick={() => abrirDetalleInventario(val)}
                          className="btn btn-light admin-icon-button"
                          aria-label={`Visualizar inventario ${val.id}`}
                          title="Visualizar datos"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          type="button"
                          onClick={() => editarInventario(val)}
                          className="btn btn-info admin-icon-button"
                          aria-label={`Editar inventario ${val.id}`}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteInventario(val.id)}
                          className="btn btn-danger admin-icon-button"
                          aria-label={`Eliminar inventario ${val.id}`}
                          title="Eliminar"
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
            {inventariosLista.map((val) => (
              <article key={val.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <span className="admin-mobile-card__eyebrow">Inventario #{val.id}</span>
                    <h3 className="admin-mobile-card__title">
                      {getProductoNombre(val.producto)}
                    </h3>
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
                    <span className="admin-mobile-card__label">Sucursal</span>
                    <strong>{getSucursalNombre(val.sucursal)}</strong>
                  </div>
                  <div className="admin-mobile-card__item">
                    <span className="admin-mobile-card__label">Proveedor</span>
                    <strong>{getProveedorNombre(val.proveedor)}</strong>
                  </div>
                  <div className="admin-mobile-card__item">
                    <span className="admin-mobile-card__label">Cantidad</span>
                    <strong>{val.cantidad}</strong>
                  </div>
                </div>

                <div className="admin-mobile-card__actions">
                  <button
                    type="button"
                    onClick={() => abrirDetalleInventario(val)}
                    className="btn btn-light admin-icon-button"
                    aria-label={`Visualizar inventario ${val.id}`}
                    title="Visualizar datos"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    type="button"
                    onClick={() => editarInventario(val)}
                    className="btn btn-info admin-icon-button"
                    aria-label={`Editar inventario ${val.id}`}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteInventario(val.id)}
                    className="btn btn-danger admin-icon-button"
                    aria-label={`Eliminar inventario ${val.id}`}
                    title="Eliminar"
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
              {editar ? "Actualizar inventario" : "Crear inventario"}
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
              <span className="admin-field__label">Cantidad</span>
              <input
                type="number"
                value={cantidad}
                onChange={(event) => setCantidad(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Cantidad disponible"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Sucursal</span>
              <select
                value={sucursal}
                onChange={(event) => setSucursal(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="">Selecciona una sucursal</option>
                {sucursalesDisponibles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Proveedor</span>
              <select
                value={proveedor}
                onChange={(event) => setProveedor(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="">Selecciona un proveedor</option>
                {proveedoresDisponibles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.marca}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Producto</span>
              <select
                value={producto}
                onChange={(event) => setProducto(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="">Selecciona un producto</option>
                {productosDisponibles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          {editar ? (
            <>
              <button className="btn btn-warning" onClick={update}>
                <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                Actualizar inventario
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
                Crear inventario
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
        onHide={cerrarDetalleInventario}
        centered
        dialogClassName="admin-modal admin-modal--details"
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">Vista detallada</span>
            <Modal.Title className="admin-modal__title">
              {inventarioDetalle
                ? getProductoNombre(inventarioDetalle.producto)
                : "Inventario"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          {inventarioDetalle && (
            <div className="admin-detail-grid">
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">ID</span>
                <strong>{inventarioDetalle.id}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Estatus</span>
                <strong>{getStatusLabel(inventarioDetalle.estatus)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Sucursal</span>
                <strong>{getSucursalNombre(inventarioDetalle.sucursal)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Proveedor</span>
                <strong>{getProveedorNombre(inventarioDetalle.proveedor)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Producto</span>
                <strong>{getProductoNombre(inventarioDetalle.producto)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Cantidad</span>
                <strong>{inventarioDetalle.cantidad}</strong>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          <button className="btn admin-page-header__ghost" onClick={cerrarDetalleInventario}>
            <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </AdminShell>
  );
}

export default Inventarios;
