import "../../App.css";
import { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faChartPie,
  faDownload,
  faEye,
  faFilter,
  faPenToSquare,
  faPlus,
  faRotateLeft,
  faShieldHalved,
  faTrash,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { generarPDF } from "../pdf/pdfUsuarios";
import AdminShell from "./AdminShell";

const getStatusLabel = (estatus) =>
  Number(estatus) === 1 ? "Activo" : "Inactivo";

const getRoleLabel = (tipo) =>
  Number(tipo) === 1 ? "Admin" : Number(tipo) === 2 ? "Cliente" : "Sin definir";

function Usuarios() {
  const [estatus, setEstatus] = useState(1);
  const [tipo, setTipo] = useState("");
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [id, setId] = useState();
  const [editar, setEditar] = useState(false);
  const [usuariosLista, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [campoBusqueda, setCampoBusqueda] = useState("global");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);

  const cerrarModal = () => {
    setMostrarModal(false);
    limpiarCampos();
  };

  const abrirDetalleUsuario = (usuario) => {
    setUsuarioDetalle(usuario);
    setMostrarDetalle(true);
  };

  const cerrarDetalleUsuario = () => {
    setMostrarDetalle(false);
    setUsuarioDetalle(null);
  };

  const abrirNuevoUsuario = () => {
    limpiarCampos();
    setMostrarModal(true);
  };

  const add = () => {
    if (
      tipo.trim() === "" ||
      clave.trim() === "" ||
      nombre.trim() === "" ||
      fechaNacimiento.trim() === "" ||
      genero.trim() === "" ||
      telefono.trim() === "" ||
      correo.trim() === "" ||
      domicilio.trim() === ""
    ) {
      Swal.fire({
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
        icon: "error",
      });
    } else {
      Axios.post("/crearUsuario", {
        estatus,
        tipo,
        clave,
        nombre,
        fechaNacimiento,
        genero,
        telefono,
        correo,
        domicilio,
      }).then(() => {
        getUsuarios();
        cerrarModal();
        Swal.fire({
          title: "Registro exitoso!",
          html: "Usuario registrado con exito.",
          icon: "success",
        });
      });
    }
  };

  const update = () => {
    Axios.put("/editarUsuario", {
      id,
      estatus,
      tipo,
      clave,
      nombre,
      fechaNacimiento,
      genero,
      telefono,
      correo,
      domicilio,
    }).then(() => {
      getUsuarios();
      cerrarModal();
      Swal.fire({
        title: "<strong>Actualizacion exitosa!</strong>",
        html: "<i>Usuario fue actualizado con exito.</i>",
        icon: "success",
      });
    });
  };

  const deleteUsuario = (userId) => {
    Swal.fire({
      title: "Desactivar usuario",
      text: "Estas seguro de desactivar este usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, desactivar",
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`/eliminarUsuario/${userId}`)
          .then(() => {
            getUsuarios();
            limpiarCampos();
            Swal.fire("Usuario inactivo", "El usuario fue desactivado con exito.", "success");
          })
          .catch((error) => {
            console.error(error);
            Swal.fire(
              "Error!",
              error?.response?.data?.error ||
                "Hubo un problema al desactivar el usuario.",
              "error"
            );
          });
      }
    });
  };

  const limpiarCampos = () => {
    setEstatus(1);
    setTipo("");
    setClave("");
    setNombre("");
    setFechaNacimiento("");
    setGenero("");
    setTelefono("");
    setCorreo("");
    setDomicilio("");
    setEditar(false);
    setId(undefined);
  };

  const editarUsuario = (val) => {
    setEditar(true);
    setId(val.id);
    setEstatus(val.estatus);
    setTipo(val.tipo);
    setClave("");
    setNombre(val.nombre);
    setFechaNacimiento(val.fechaNacimiento);
    setGenero(val.genero);
    setTelefono(val.telefono);
    setCorreo(val.correo);
    setDomicilio(val.domicilio);
    setMostrarModal(true);
  };

  const getUsuarios = useCallback(() => {
    Axios.get("/verUsuario").then((response) => {
      const usuariosFiltrados = response.data.filter((usuario) => {
        switch (campoBusqueda) {
          case "global": {
            const idMatch = usuario.id.toString().includes(busqueda);
            const usuarioMatch = usuario.nombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const tipoMatch = getRoleLabel(usuario.tipo)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const estatusMatch = getStatusLabel(usuario.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
            const fechaMatch = usuario.fechaNacimiento
              .toString()
              .includes(busqueda);
            const generoMatch = usuario.genero.toString().includes(busqueda);
            const telefonoMatch = usuario.telefono
              .toString()
              .includes(busqueda);
            const correoMatch = usuario.correo.toString().includes(busqueda);
            const domicilioMatch = usuario.domicilio
              .toString()
              .includes(busqueda);
            return (
              idMatch ||
              usuarioMatch ||
              tipoMatch ||
              estatusMatch ||
              fechaMatch ||
              generoMatch ||
              telefonoMatch ||
              correoMatch ||
              domicilioMatch
            );
          }
          case "id":
            return Number(usuario.id) === Number(busqueda);
          case "estatus":
            return getStatusLabel(usuario.estatus)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "tipo":
            return getRoleLabel(usuario.tipo)
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "nombre":
            return usuario.nombre
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "fecha":
            return usuario.fechaNacimiento
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "genero":
            return usuario.genero
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "telefono":
            return usuario.telefono
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "correo":
            return usuario.correo
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          case "domicilio":
            return usuario.domicilio
              .toLowerCase()
              .includes(busqueda.toLowerCase());
          default:
            return false;
        }
      });
      setUsuarios(usuariosFiltrados);
    });
  }, [busqueda, campoBusqueda]);

  useEffect(() => {
    getUsuarios();
  }, [getUsuarios]);

  const handleGenerarPDF = () => {
    Axios.get("/verUsuario")
      .then((response) => {
        generarPDF(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener usuarios:", error);
        Swal.fire("Error", "No se pudo generar el PDF", "error");
      });
  };

  const totalUsuarios = usuariosLista.length;
  const admins = usuariosLista.filter((usuario) => Number(usuario.tipo) === 1).length;
  const clientes = usuariosLista.filter((usuario) => Number(usuario.tipo) === 2).length;
  const activos = usuariosLista.filter((usuario) => Number(usuario.estatus) === 1).length;
  const inactivos = totalUsuarios - activos;
  const activePercentage = totalUsuarios
    ? Math.round((activos / totalUsuarios) * 100)
    : 0;

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Administracion</span>
          <h1 className="admin-page-header__title">Gestion de usuarios</h1>
          <p className="admin-page-header__text">
            Controla accesos, visualiza la salud del modulo y abre el formulario
            solo cuando realmente lo necesitas.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button className="btn btn-success" onClick={abrirNuevoUsuario}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nuevo usuario
          </button>
          <button className="btn btn-secondary" onClick={handleGenerarPDF}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Exportar PDF
          </button>
          <Link
            to="/cruds"
            className="btn btn-outline-success admin-page-header__ghost"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
            Volver al panel
          </Link>
        </div>
      </section>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faUsers} />
          </span>
          <span className="admin-stat-card__label">Usuarios visibles</span>
          <strong className="admin-stat-card__value">{totalUsuarios}</strong>
          <span className="admin-stat-card__meta">Resultados del filtro actual</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faShieldHalved} />
          </span>
          <span className="admin-stat-card__label">Administradores</span>
          <strong className="admin-stat-card__value">{admins}</strong>
          <span className="admin-stat-card__meta">Cuentas con control total</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faUser} />
          </span>
          <span className="admin-stat-card__label">Clientes</span>
          <strong className="admin-stat-card__value">{clientes}</strong>
          <span className="admin-stat-card__meta">Perfiles de compra activos</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faChartPie} />
          </span>
          <span className="admin-stat-card__label">Estado</span>
          <strong className="admin-stat-card__value">{activePercentage}%</strong>
          <span className="admin-stat-card__meta">Usuarios activos del total</span>
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
            Cambia el campo de busqueda y localiza usuarios sin perder de vista
            el resumen general del modulo.
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
                <option value="tipo">Tipo</option>
                <option value="nombre">Nombre</option>
                <option value="fecha">Fecha</option>
                <option value="genero">Genero</option>
                <option value="telefono">Telefono</option>
                <option value="correo">Correo</option>
                <option value="domicilio">Domicilio</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Termino</span>
              <input
                type="text"
                name="admin-search-term"
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

          <div className="admin-side-card__summary">
            <span className="admin-side-card__summary-label">Estado del panel</span>
            <strong className="admin-side-card__summary-value">
              {editar
                ? "Editando desde modal"
                : mostrarModal
                ? "Creando nuevo usuario"
                : "Dashboard listo"}
            </strong>
            <span className="admin-side-card__summary-copy">
              {mostrarModal
                ? "El formulario esta abierto para que trabajes sin romper el layout."
                : "Usa el boton Nuevo usuario o edita un registro desde la tabla."}
            </span>
          </div>
        </aside>

        <section className="admin-table-card">
          <div className="admin-table-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Listado</span>
              <h2 className="admin-table-card__title">
                <FontAwesomeIcon icon={faAddressBook} className="me-2" />
                Usuarios registrados
              </h2>
            </div>
            <span className="admin-table-card__count">
              {totalUsuarios} resultados
            </span>
          </div>

          <div className="admin-table-wrap">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Estatus</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosLista.map((val) => (
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
                    <td>{getRoleLabel(val.tipo)}</td>
                    <td>{val.nombre}</td>
                    <td>{val.correo}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          onClick={() => abrirDetalleUsuario(val)}
                          className="btn btn-light admin-icon-button"
                          aria-label={`Visualizar datos de ${val.nombre}`}
                          title="Visualizar datos"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          type="button"
                          onClick={() => editarUsuario(val)}
                          className="btn btn-info admin-icon-button"
                          aria-label={`Editar ${val.nombre}`}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUsuario(val.id)}
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
            {usuariosLista.map((val) => (
              <article key={val.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <span className="admin-mobile-card__eyebrow">Usuario #{val.id}</span>
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
                    <span className="admin-mobile-card__label">Tipo</span>
                    <strong>{getRoleLabel(val.tipo)}</strong>
                  </div>
                  <div className="admin-mobile-card__item">
                    <span className="admin-mobile-card__label">Correo</span>
                    <strong>{val.correo}</strong>
                  </div>
                </div>

                <div className="admin-mobile-card__actions">
                  <button
                    type="button"
                    onClick={() => abrirDetalleUsuario(val)}
                    className="btn btn-light admin-icon-button"
                    aria-label={`Visualizar datos de ${val.nombre}`}
                    title="Visualizar datos"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    type="button"
                    onClick={() => editarUsuario(val)}
                    className="btn btn-info admin-icon-button"
                    aria-label={`Editar ${val.nombre}`}
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteUsuario(val.id)}
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
              {editar ? "Actualizar usuario" : "Crear usuario"}
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
              <span className="admin-field__label">Tipo</span>
              <select
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="">Selecciona un tipo</option>
                <option value="1">Administrador</option>
                <option value="2">Cliente</option>
              </select>
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Contrasena</span>
              <input
                type="password"
                name="admin-user-password"
                value={clave}
                onChange={(event) => setClave(event.target.value)}
                className="form-control admin-field__control"
                placeholder={
                  editar
                    ? "Escribe una nueva contrasena o dejala vacia"
                    : "Ingresa una contrasena"
                }
                autoComplete={editar ? "new-password" : "new-password"}
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Nombre</span>
              <input
                type="text"
                name="admin-user-name"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Nombre completo"
                autoComplete="name"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Fecha de nacimiento</span>
              <input
                type="date"
                name="admin-user-birthdate"
                value={fechaNacimiento}
                onChange={(event) => setFechaNacimiento(event.target.value)}
                className="form-control admin-field__control"
                autoComplete="bday"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Genero</span>
              <select
                value={genero}
                onChange={(event) => setGenero(event.target.value)}
                className="form-select admin-field__control"
              >
                <option value="">Selecciona un genero</option>
                <option value="MASCULINO">MASCULINO</option>
                <option value="FEMENINO">FEMENINO</option>
                <option value="OTRO">OTRO</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Telefono</span>
              <input
                type="tel"
                name="admin-user-phone"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Numero de contacto"
                autoComplete="tel"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Correo</span>
              <input
                type="email"
                name="admin-user-email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                className="form-control admin-field__control"
                placeholder="correo@dominio.com"
                autoComplete="email"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Domicilio</span>
              <input
                type="text"
                name="admin-user-address"
                value={domicilio}
                onChange={(event) => setDomicilio(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Direccion o referencias"
                autoComplete="street-address"
              />
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          {editar ? (
            <>
              <button className="btn btn-warning" onClick={update}>
                <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                Actualizar usuario
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
                Crear usuario
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
        onHide={cerrarDetalleUsuario}
        centered
        dialogClassName="admin-modal admin-modal--details"
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">Vista detallada</span>
            <Modal.Title className="admin-modal__title">
              {usuarioDetalle?.nombre || "Usuario"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          {usuarioDetalle && (
            <div className="admin-detail-grid">
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">ID</span>
                <strong>{usuarioDetalle.id}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Estatus</span>
                <strong>{getStatusLabel(usuarioDetalle.estatus)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Tipo</span>
                <strong>{getRoleLabel(usuarioDetalle.tipo)}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Nombre</span>
                <strong>{usuarioDetalle.nombre}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Fecha de nacimiento</span>
                <strong>{usuarioDetalle.fechaNacimiento}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Genero</span>
                <strong>{usuarioDetalle.genero}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Telefono</span>
                <strong>{usuarioDetalle.telefono}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Correo</span>
                <strong>{usuarioDetalle.correo}</strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Domicilio</span>
                <strong>{usuarioDetalle.domicilio}</strong>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          <button className="btn admin-page-header__ghost" onClick={cerrarDetalleUsuario}>
            <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </AdminShell>
  );
}

export default Usuarios;
