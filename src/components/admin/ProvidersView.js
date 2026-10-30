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
  faChartPie,
  faDownload,
  faEye,
  faFilter,
  faHandshake,
  faPenToSquare,
  faPlus,
  faRotateLeft,
  faStore,
  faTrash,
  faTruckField,
} from "@fortawesome/free-solid-svg-icons";
import AdminShell from "./AdminShell";

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts;

const getStatusLabel = (estatus) =>
  Number(estatus) === 1 ? "Activo" : "Inactivo";

function Proveedores() {
  const [estatus, setEstatus] = useState(1);
  const [marca, setMarca] = useState("");
  const [representante, setRepresentante] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaContrato, setFechaContrato] = useState("");
  const [id, setId] = useState();
  const [editar, setEditar] = useState(false);
  const [proveedoresLista, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [campoBusqueda, setCampoBusqueda] = useState("global");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [proveedorDetalle, setProveedorDetalle] = useState(null);

  const cerrarModal = () => {
    setMostrarModal(false);
    limpiarCampos();
  };

  const abrirNuevoProveedor = () => {
    limpiarCampos();
    setMostrarModal(true);
  };

  const abrirDetalleProveedor = (proveedor) => {
    setProveedorDetalle(proveedor);
    setMostrarDetalle(true);
  };

  const cerrarDetalleProveedor = () => {
    setProveedorDetalle(null);
    setMostrarDetalle(false);
  };

  const add = () => {
    if (
      marca.trim() === "" ||
      representante.trim() === "" ||
      fechaContrato.trim() === "" ||
      telefono.trim() === "" ||
      correo.trim() === "" ||
      direccion.trim() === ""
    ) {
      Swal.fire({
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
        icon: "error",
      });
    } else {
      Axios.post("/crearProveedor", {
        estatus,
        marca,
        representante,
        fechaContrato,
        telefono,
        correo,
        direccion,
      })
        .then(() => {
          getProveedores();
          cerrarModal();
          Swal.fire({
            title: "Registro exitoso!",
            html: "Proveedor registrado con exito.",
            icon: "success",
          });
        })
        .catch((error) => {
          console.error(error);
          Swal.fire("Error", error?.response?.data?.error || "No se pudo crear el proveedor.", "error");
        });
    }
  };

  const update = () => {
    Axios.put("/editarProveedor", {
      id,
      estatus,
      marca,
      representante,
      telefono,
      correo,
      direccion,
      fechaContrato,
    })
      .then(() => {
        getProveedores();
        cerrarModal();
        Swal.fire({
          title: "<strong>Actualizacion exitosa!</strong>",
          html: "<i>Proveedor fue actualizado con exito.</i>",
          icon: "success",
        });
      })
      .catch((error) => {
        console.error(error);
        Swal.fire("Error", error?.response?.data?.error || "No se pudo actualizar el proveedor.", "error");
      });
  };

  const deleteProveedor = (providerId) => {
    Swal.fire({
      title: "Desactivar proveedor",
      text: "Estas seguro de desactivar este proveedor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, desactivar",
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`/eliminarProveedor/${providerId}`)
          .then(() => {
            getProveedores();
            limpiarCampos();
            Swal.fire("Proveedor inactivo", "El proveedor fue desactivado con exito.", "success");
          })
          .catch((error) => {
            console.error(error);
            Swal.fire(
              "Error!",
              error?.response?.data?.error ||
                "Hubo un problema al desactivar el proveedor.",
              "error"
            );
          });
      }
    });
  };

  const limpiarCampos = () => {
    setEstatus(1);
    setMarca("");
    setRepresentante("");
    setFechaContrato("");
    setTelefono("");
    setCorreo("");
    setDireccion("");
    setEditar(false);
    setId(undefined);
  };

  const editarProveedor = (val) => {
    setEditar(true);
    setId(val.id);
    setEstatus(val.estatus);
    setMarca(val.marca);
    setRepresentante(val.representante);
    setFechaContrato(val.fechaContrato);
    setTelefono(val.telefono);
    setCorreo(val.correo);
    setDireccion(val.direccion);
    setMostrarModal(true);
  };

  const getProveedores = useCallback(() => {
    Axios.get("/verProveedor").then((response) => {
      const proveedoresFiltrados = response.data.filter((proveedor) => {
        switch (campoBusqueda) {
          case "global": {
            const idMatch = proveedor.id.toString().includes(busqueda);
            const proveedorMatch = proveedor.representante
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const marcaMatch = proveedor.marca.toString().includes(busqueda);
            const estatusMatch = getStatusLabel(proveedor.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const fechaMatch = proveedor.fechaContrato
              .toString()
              .includes(busqueda);
            const telefonoMatch = proveedor.telefono
              .toString()
              .includes(busqueda);
            const correoMatch = proveedor.correo.toString().includes(busqueda);
            const direccionMatch = proveedor.direccion
              .toString()
              .includes(busqueda);
            return (
              idMatch ||
              proveedorMatch ||
              marcaMatch ||
              estatusMatch ||
              fechaMatch ||
              telefonoMatch ||
              correoMatch ||
              direccionMatch
            );
          }
          case "id":
            return Number(proveedor.id) === Number(busqueda);
          case "estatus":
            return getStatusLabel(proveedor.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "marca":
            return proveedor.marca
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "representante":
            return proveedor.representante
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "fecha":
            return proveedor.fechaContrato
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "telefono":
            return proveedor.telefono
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "correo":
            return proveedor.correo
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "direccion":
            return proveedor.direccion
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          default:
            return false;
        }
      });
      setProveedores(proveedoresFiltrados);
    });
  }, [busqueda, campoBusqueda]);

  useEffect(() => {
    getProveedores();
  }, [getProveedores]);

  const generarPDF = () => {
    Axios.get("/verProveedor")
      .then((response) => {
        const proveedoresPDF = response.data.map((proveedor) => [
          proveedor.id,
          getStatusLabel(proveedor.estatus),
          proveedor.marca,
          proveedor.representante,
          proveedor.telefono,
          proveedor.correo,
          proveedor.direccion,
          proveedor.fechaContrato,
        ]);

        const docDefinition = {
          content: [
            { text: "Informe de proveedores", style: "header" },
            {
              table: {
                headerRows: 1,
                widths: [
                  "auto",
                  "auto",
                  "auto",
                  "auto",
                  "auto",
                  "auto",
                  "auto",
                  "auto",
                ],
                body: [
                  [
                    "#",
                    "Estatus",
                    "Marca",
                    "Representante",
                    "Telefono",
                    "Correo",
                    "Direccion",
                    "Fecha de Contrato",
                  ],
                  ...proveedoresPDF,
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
        console.error("Error al obtener proveedores:", error);
      });
  };

  const totalProveedores = proveedoresLista.length;
  const activos = proveedoresLista.filter((item) => Number(item.estatus) === 1).length;
  const inactivos = totalProveedores - activos;
  const activePercentage = totalProveedores
    ? Math.round((activos / totalProveedores) * 100)
    : 0;

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Administracion</span>
          <h1 className="admin-page-header__title">Gestion de proveedores</h1>
          <p className="admin-page-header__text">
            Centraliza marcas, representantes y contratos con un listado claro y
            vistas de detalle sin ensuciar el dashboard.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button className="btn btn-success" onClick={abrirNuevoProveedor}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nuevo proveedor
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
            <FontAwesomeIcon icon={faTruckField} />
          </span>
          <span className="admin-stat-card__label">Proveedores visibles</span>
          <strong className="admin-stat-card__value">{totalProveedores}</strong>
          <span className="admin-stat-card__meta">Resultados del filtro actual</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faStore} />
          </span>
          <span className="admin-stat-card__label">Marcas registradas</span>
          <strong className="admin-stat-card__value">{totalProveedores}</strong>
          <span className="admin-stat-card__meta">Aliados comerciales activos</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faHandshake} />
          </span>
          <span className="admin-stat-card__label">Activos</span>
          <strong className="admin-stat-card__value">{activos}</strong>
          <span className="admin-stat-card__meta">Proveedores operativos hoy</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faChartPie} />
          </span>
          <span className="admin-stat-card__label">Estado</span>
          <strong className="admin-stat-card__value">{activePercentage}%</strong>
          <span className="admin-stat-card__meta">Proveedores activos del total</span>
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
            Encuentra un proveedor por marca, representante o estatus y consulta
            su ficha completa desde un solo lugar.
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
                <option value="marca">Marca</option>
                <option value="representante">Representante</option>
                <option value="telefono">Telefono</option>
                <option value="correo">Correo</option>
                <option value="direccion">Direccion</option>
                <option value="fecha">Fecha</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Termino</span>
              <input
                type="text"
                name="admin-provider-search"
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
                <FontAwesomeIcon icon={faTruckField} className="me-2" />
                Proveedores registrados
              </h2>
            </div>
            <span className="admin-table-card__count">{totalProveedores} resultados</span>
          </div>

          <div className="admin-table-wrap">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Estatus</th>
                  <th scope="col">Marca</th>
                  <th scope="col">Representante</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresLista.map((val) => (
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
                    <td>{val.marca}</td>
                    <td>{val.representante}</td>
                    <td>{val.correo}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          onClick={() => abrirDetalleProveedor(val)}
                          className="btn btn-light admin-icon-button"
                          aria-label={`Visualizar datos de ${val.marca}`}
                          title="Visualizar datos"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          type="button"
                          onClick={() => editarProveedor(val)}
                          className="btn btn-info admin-icon-button"
                          aria-label={`Editar ${val.marca}`}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProveedor(val.id)}
                          className="btn btn-danger admin-icon-button"
                          aria-label={`Desactivar ${val.marca}`}
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
            {proveedoresLista.map((val) => (
              <article key={val.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <span className="admin-mobile-card__eyebrow">Proveedor #{val.id}</span>
                    <h3 className="admin-mobile-card__title">{val.marca}</h3>
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
                    <span className="admin-mobile-card__label">Representante</span>
                    <strong>{val.representante}</strong>
                  </div>
                  <div className="admin-mobile-card__item">
                    <span className="admin-mobile-card__label">Correo</span>
                    <strong>{val.correo}</strong>
                  </div>
                </div>

                <div className="admin-mobile-card__actions">
                  <button
                    type="button"
                    onClick={() => abrirDetalleProveedor(val)}
                    className="btn btn-light admin-icon-button"
                    aria-label={`Visualizar datos de ${val.marca}`}
                    title="Visualizar datos"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    type="button"
                    onClick={() => editarProveedor(val)}
                    className="btn btn-info admin-icon-button"
                    aria-label={`Editar ${val.marca}`}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProveedor(val.id)}
                    className="btn btn-danger admin-icon-button"
                    aria-label={`Desactivar ${val.marca}`}
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
              {editar ? "Actualizar proveedor" : "Crear proveedor"}
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
              <span className="admin-field__label">Marca</span>
              <input
                type="text"
                name="admin-provider-brand"
                value={marca}
                onChange={(event) => setMarca(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Marca o proveedor"
                autoComplete="organization"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Representante</span>
              <input
                type="text"
                name="admin-provider-representative"
                value={representante}
                onChange={(event) => setRepresentante(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Nombre del representante"
                autoComplete="name"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Telefono</span>
              <input
                type="tel"
                name="admin-provider-phone"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Telefono de contacto"
                autoComplete="tel"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Correo</span>
              <input
                type="email"
                name="admin-provider-email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                className="form-control admin-field__control"
                placeholder="correo@dominio.com"
                autoComplete="email"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Direccion</span>
              <input
                type="text"
                name="admin-provider-address"
                value={direccion}
                onChange={(event) => setDireccion(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Direccion o referencias"
                autoComplete="street-address"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Fecha de contrato</span>
              <input
                type="date"
                name="admin-provider-contract-date"
                value={fechaContrato}
                onChange={(event) => setFechaContrato(event.target.value)}
                className="form-control admin-field__control"
                autoComplete="off"
              />
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          {editar ? (
            <>
              <button className="btn btn-warning" onClick={update}>
                <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                Actualizar proveedor
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
                Crear proveedor
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
        onHide={cerrarDetalleProveedor}
        centered
        dialogClassName="admin-modal admin-modal--details"
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">Vista detallada</span>
            <Modal.Title className="admin-modal__title">
              {proveedorDetalle?.marca || "Proveedor"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          {proveedorDetalle && (
            <div className="admin-detail-grid">
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">ID</span>
                <strong>{proveedorDetalle.id}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Estatus</span>
                <strong>{getStatusLabel(proveedorDetalle.estatus)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Marca</span>
                <strong>{proveedorDetalle.marca}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Representante</span>
                <strong>{proveedorDetalle.representante}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Telefono</span>
                <strong>{proveedorDetalle.telefono}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Correo</span>
                <strong>{proveedorDetalle.correo}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Fecha de contrato</span>
                <strong>{proveedorDetalle.fechaContrato}</strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Direccion</span>
                <strong>{proveedorDetalle.direccion}</strong>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          <button className="btn admin-page-header__ghost" onClick={cerrarDetalleProveedor}>
            <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </AdminShell>
  );
}

export default Proveedores;
