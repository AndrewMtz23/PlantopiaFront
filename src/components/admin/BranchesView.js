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
  faBuilding,
  faChartPie,
  faDownload,
  faEye,
  faFilter,
  faMapLocationDot,
  faPenToSquare,
  faPlus,
  faRotateLeft,
  faTrash,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import AdminShell from "./AdminShell";
import BranchMap from "./BranchMap";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const getStatusLabel = (estatus) =>
  Number(estatus) === 1 ? "Activo" : "Inactivo";

function Sucursales() {
  const [estatus, setEstatus] = useState(1);
  const [gerente, setGerente] = useState("");
  const [gerentesDisponibles, setGerentesDisponibles] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [id, setId] = useState();
  const [editar, setEditar] = useState(false);
  const [sucursalesLista, setSucursales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [campoBusqueda, setCampoBusqueda] = useState("global");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [sucursalDetalle, setSucursalDetalle] = useState(null);

  const getGerenteNombre = useCallback(
    (gerenteId) =>
      gerentesDisponibles.find((item) => Number(item.id) === Number(gerenteId))
        ?.nombre || `Gerente #${gerenteId}`,
    [gerentesDisponibles]
  );

  const cerrarModal = () => {
    setMostrarModal(false);
    limpiarCampos();
  };

  const abrirNuevaSucursal = () => {
    limpiarCampos();
    setMostrarModal(true);
  };

  const abrirDetalleSucursal = (sucursal) => {
    setSucursalDetalle(sucursal);
    setMostrarDetalle(true);
  };

  const cerrarDetalleSucursal = () => {
    setSucursalDetalle(null);
    setMostrarDetalle(false);
  };

  const add = () => {
    if (
      gerente.trim() === "" ||
      nombre.trim() === "" ||
      telefono.trim() === "" ||
      direccion.trim() === ""
    ) {
      Swal.fire({
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
        icon: "error",
      });
    } else {
      Axios.post("/crearSucursal", {
        estatus,
        gerente,
        nombre,
        telefono,
        direccion,
        latitud,
        longitud,
      })
        .then(() => {
          getSucursales();
          cerrarModal();
          Swal.fire({
            title: "Registro exitoso!",
            html: "Sucursal registrada con exito.",
            icon: "success",
          });
        })
        .catch((error) => {
          console.error(error);
          Swal.fire("Error", error?.response?.data?.error || "No se pudo crear la sucursal.", "error");
        });
    }
  };

  const update = () => {
    Axios.put("/editarSucursal", {
      id,
      estatus,
      gerente,
      nombre,
      telefono,
      direccion,
      latitud,
      longitud,
    })
      .then(() => {
        getSucursales();
        cerrarModal();
        Swal.fire({
          title: "<strong>Actualizacion exitosa!</strong>",
          html: "<i>Sucursal fue actualizada con exito.</i>",
          icon: "success",
        });
      })
      .catch((error) => {
        console.error(error);
        Swal.fire("Error", error?.response?.data?.error || "No se pudo actualizar la sucursal.", "error");
      });
  };

  const deleteSucursal = (branchId) => {
    Swal.fire({
      title: "Desactivar sucursal",
      text: "Estas seguro de desactivar esta sucursal?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, desactivar",
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`/eliminarSucursal/${branchId}`)
          .then(() => {
            getSucursales();
            limpiarCampos();
            Swal.fire("Sucursal inactiva", "La sucursal fue desactivada con exito.", "success");
          })
          .catch((error) => {
            console.error(error);
            Swal.fire(
              "Error!",
              error?.response?.data?.error ||
                "Hubo un problema al desactivar la sucursal.",
              "error"
            );
          });
      }
    });
  };

  const limpiarCampos = () => {
    setEstatus(1);
    setGerente("");
    setNombre("");
    setTelefono("");
    setDireccion("");
    setLatitud("");
    setLongitud("");
    setEditar(false);
    setId(undefined);
  };

  const editarSucursal = (val) => {
    setEditar(true);
    setId(val.id);
    setEstatus(val.estatus);
    setGerente(val.gerente);
    setNombre(val.nombre);
    setTelefono(val.telefono);
    setDireccion(val.direccion);
    setLatitud(val.latitud ?? "");
    setLongitud(val.longitud ?? "");
    setMostrarModal(true);
  };

  const seleccionarUbicacion = ({ latitud: nextLatitude, longitud: nextLongitude }) => {
    setLatitud(nextLatitude);
    setLongitud(nextLongitude);
  };

  const getSucursales = useCallback(() => {
    Axios.get("/verSucursal").then((response) => {
      const sucursalesFiltradas = response.data.filter((sucursal) => {
        const gerenteNombre = getGerenteNombre(sucursal.gerente);

        switch (campoBusqueda) {
          case "global": {
            const idMatch = sucursal.id.toString().includes(busqueda);
            const sucursalMatch = sucursal.nombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const gerenteMatch = gerenteNombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const estatusMatch = getStatusLabel(sucursal.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const telefonoMatch = sucursal.telefono
              .toString()
              .includes(busqueda);
            const direccionMatch = sucursal.direccion
              .toString()
              .includes(busqueda);
            return (
              idMatch ||
              sucursalMatch ||
              gerenteMatch ||
              estatusMatch ||
              telefonoMatch ||
              direccionMatch
            );
          }
          case "id":
            return Number(sucursal.id) === Number(busqueda);
          case "estatus":
            return getStatusLabel(sucursal.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "gerente":
            return gerenteNombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "nombre":
            return sucursal.nombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "telefono":
            return sucursal.telefono
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "direccion":
            return sucursal.direccion
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          default:
            return false;
        }
      });
      setSucursales(sucursalesFiltradas);
    });
  }, [busqueda, campoBusqueda, getGerenteNombre]);

  useEffect(() => {
    getSucursales();
  }, [getSucursales]);

  const getGerentesDisponibles = useCallback(() => {
    Axios.get("/verGerente")
      .then((response) => {
        setGerentesDisponibles(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    getGerentesDisponibles();
  }, [getGerentesDisponibles]);

  const generarPDF = () => {
    Axios.get("/verSucursal")
      .then((response) => {
        const sucursalesPDF = response.data.map((sucursal) => [
          sucursal.id,
          getStatusLabel(sucursal.estatus),
          getGerenteNombre(sucursal.gerente),
          sucursal.nombre,
          sucursal.telefono,
          sucursal.direccion,
        ]);

        const docDefinition = {
          content: [
            { text: "Informe de sucursales", style: "header" },
            {
              table: {
                headerRows: 1,
                widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
                body: [
                  ["#", "Estatus", "Id gerente", "Nombre", "Telefono", "Direccion"],
                  ...sucursalesPDF,
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
        console.error("Error al obtener sucursales:", error);
      });
  };

  const totalSucursales = sucursalesLista.length;
  const activas = sucursalesLista.filter((item) => Number(item.estatus) === 1).length;
  const inactivas = totalSucursales - activas;
  const ubicadas = sucursalesLista.filter((item) => item.latitud && item.longitud).length;
  const activePercentage = totalSucursales
    ? Math.round((activas / totalSucursales) * 100)
    : 0;

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Administracion</span>
          <h1 className="admin-page-header__title">Gestion de sucursales</h1>
          <p className="admin-page-header__text">
            Supervisa sedes, responsables y contacto con una vista compacta y
            un detalle completo cuando lo necesites.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button className="btn btn-success" onClick={abrirNuevaSucursal}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nueva sucursal
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
            <FontAwesomeIcon icon={faBuilding} />
          </span>
          <span className="admin-stat-card__label">Sucursales visibles</span>
          <strong className="admin-stat-card__value">{totalSucursales}</strong>
          <span className="admin-stat-card__meta">Resultados del filtro actual</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faUserTie} />
          </span>
          <span className="admin-stat-card__label">Gerentes listados</span>
          <strong className="admin-stat-card__value">{gerentesDisponibles.length}</strong>
          <span className="admin-stat-card__meta">Disponibles para asignacion</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faMapLocationDot} />
          </span>
          <span className="admin-stat-card__label">Activas</span>
          <strong className="admin-stat-card__value">{activas}</strong>
          <span className="admin-stat-card__meta">Sucursales operando hoy</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faChartPie} />
          </span>
          <span className="admin-stat-card__label">Estado</span>
          <strong className="admin-stat-card__value">{activePercentage}%</strong>
          <span className="admin-stat-card__meta">Sucursales activas del total</span>
        </article>
      </section>

      <section className="admin-map-panel">
        <div className="admin-map-panel__header">
          <div>
            <span className="admin-table-card__eyebrow">Mapa operativo</span>
            <h2 className="admin-table-card__title">
              <FontAwesomeIcon icon={faMapLocationDot} className="me-2" />
              Sucursales geolocalizadas
            </h2>
          </div>
          <span className="admin-table-card__count">{ubicadas} ubicadas</span>
        </div>
        <BranchMap branches={sucursalesLista} />
      </section>

      <section className="admin-panel-grid admin-panel-grid--users">
        <aside className="admin-side-card">
          <span className="admin-side-card__eyebrow">Visibilidad</span>
          <h3 className="admin-side-card__title">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Busqueda y filtro
          </h3>
          <p className="admin-side-card__text">
            Localiza una sucursal por nombre, gerente o estatus y revisa su
            detalle completo desde el dashboard.
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
                <option value="gerente">Gerente</option>
                <option value="nombre">Nombre</option>
                <option value="telefono">Telefono</option>
                <option value="direccion">Direccion</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Termino</span>
              <input
                type="text"
                name="admin-branch-search"
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
                <span>activas</span>
              </div>
            </div>

            <div className="admin-status-chart__legend">
              <div className="admin-status-chart__legend-item">
                <span className="admin-status-chart__dot admin-status-chart__dot--active" />
                <span>Activas</span>
                <strong>{activas}</strong>
              </div>
              <div className="admin-status-chart__legend-item">
                <span className="admin-status-chart__dot admin-status-chart__dot--inactive" />
                <span>Inactivas</span>
                <strong>{inactivas}</strong>
              </div>
            </div>
          </div>
        </aside>

        <section className="admin-table-card">
          <div className="admin-table-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Listado</span>
              <h2 className="admin-table-card__title">
                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                Sucursales registradas
              </h2>
            </div>
            <span className="admin-table-card__count">{totalSucursales} resultados</span>
          </div>

          <div className="admin-table-wrap">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Estatus</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Telefono</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sucursalesLista.map((val) => (
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
                    <td>{val.telefono}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          onClick={() => abrirDetalleSucursal(val)}
                          className="btn btn-light admin-icon-button"
                          aria-label={`Visualizar datos de ${val.nombre}`}
                          title="Visualizar datos"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          type="button"
                          onClick={() => editarSucursal(val)}
                          className="btn btn-info admin-icon-button"
                          aria-label={`Editar ${val.nombre}`}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSucursal(val.id)}
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
            {sucursalesLista.map((val) => (
              <article key={val.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <span className="admin-mobile-card__eyebrow">Sucursal #{val.id}</span>
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
                    <span className="admin-mobile-card__label">Telefono</span>
                    <strong>{val.telefono}</strong>
                  </div>
                  <div className="admin-mobile-card__item">
                    <span className="admin-mobile-card__label">Gerente</span>
                    <strong>{getGerenteNombre(val.gerente)}</strong>
                  </div>
                </div>

                <div className="admin-mobile-card__actions">
                  <button
                    type="button"
                    onClick={() => abrirDetalleSucursal(val)}
                    className="btn btn-light admin-icon-button"
                    aria-label={`Visualizar datos de ${val.nombre}`}
                    title="Visualizar datos"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    type="button"
                    onClick={() => editarSucursal(val)}
                    className="btn btn-info admin-icon-button"
                    aria-label={`Editar ${val.nombre}`}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSucursal(val.id)}
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
              {editar ? "Actualizar sucursal" : "Crear sucursal"}
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
              <span className="admin-field__label">Gerente</span>
              <select
                value={gerente}
                onChange={(event) => setGerente(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="">Selecciona un gerente</option>
                {gerentesDisponibles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Nombre</span>
              <input
                type="text"
                name="admin-branch-name"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Nombre de la sucursal"
                autoComplete="organization"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Telefono</span>
              <input
                type="tel"
                name="admin-branch-phone"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Telefono de contacto"
                autoComplete="tel"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Direccion</span>
              <input
                type="text"
                name="admin-branch-address"
                value={direccion}
                onChange={(event) => setDireccion(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Direccion o referencias"
                autoComplete="street-address"
              />
            </label>

            <div className="admin-field admin-field--wide">
              <span className="admin-field__label">Ubicacion en mapa</span>
              <BranchMap
                branches={[]}
                selectedPosition={{ latitud, longitud }}
                onPickLocation={seleccionarUbicacion}
                interactivePicker
                className="branch-map--picker"
              />
              <div className="admin-coordinate-grid">
                <input
                  type="number"
                  value={latitud}
                  onChange={(event) => setLatitud(event.target.value)}
                  className="form-control admin-field__control"
                  placeholder="Latitud"
                  step="0.000001"
                />
                <input
                  type="number"
                  value={longitud}
                  onChange={(event) => setLongitud(event.target.value)}
                  className="form-control admin-field__control"
                  placeholder="Longitud"
                  step="0.000001"
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          {editar ? (
            <>
              <button className="btn btn-warning" onClick={update}>
                <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                Actualizar sucursal
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
                Crear sucursal
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
        onHide={cerrarDetalleSucursal}
        centered
        dialogClassName="admin-modal admin-modal--details"
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">Vista detallada</span>
            <Modal.Title className="admin-modal__title">
              {sucursalDetalle?.nombre || "Sucursal"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          {sucursalDetalle && (
            <div className="admin-detail-grid">
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">ID</span>
                <strong>{sucursalDetalle.id}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Estatus</span>
                <strong>{getStatusLabel(sucursalDetalle.estatus)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Gerente</span>
                <strong>{getGerenteNombre(sucursalDetalle.gerente)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Nombre</span>
                <strong>{sucursalDetalle.nombre}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Telefono</span>
                <strong>{sucursalDetalle.telefono}</strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Direccion</span>
                <strong>{sucursalDetalle.direccion}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Latitud</span>
                <strong>{sucursalDetalle.latitud || "Sin ubicar"}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Longitud</span>
                <strong>{sucursalDetalle.longitud || "Sin ubicar"}</strong>
              </div>
              {sucursalDetalle.latitud && sucursalDetalle.longitud && (
                <div className="admin-detail-card admin-detail-card--wide">
                  <span className="admin-detail-card__label">Mapa</span>
                  <BranchMap branches={[sucursalDetalle]} className="branch-map--detail" />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          <button className="btn admin-page-header__ghost" onClick={cerrarDetalleSucursal}>
            <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </AdminShell>
  );
}

export default Sucursales;
