import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags, faPlus, faRotateLeft, faPenToSquare, faTrash, faFilter, faCheckCircle, faFileAlt, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { apiFetch } from "../../config/api";
import AdminShell from "../../components/admin/AdminShell";
import toast from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

function CategoriesPage() {
  const [categorias, setCategorias] = useState([]);
  const [categoriasLista, setCategoriasLista] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [id, setId] = useState();
  const [editar, setEditar] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // States for search and filter
  const [busqueda, setBusqueda] = useState("");
  const [campoBusqueda, setCampoBusqueda] = useState("global");

  const fetchCategorias = useCallback(async () => {
    try {
      const res = await apiFetch("/categorias", { method: "GET" });
      const data = await res.json();
      if (res.ok) {
        setCategorias(data);
      } else {
        toast.error("Error al cargar categorías");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de red");
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Handle Search Filtering
  useEffect(() => {
    const filtradas = categorias.filter((cat) => {
      switch (campoBusqueda) {
        case "global":
          return (
            cat.id.toString().includes(busqueda) ||
            cat.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (cat.descripcion && cat.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
          );
        case "id":
          return cat.id.toString() === busqueda;
        case "nombre":
          return cat.nombre.toLowerCase().includes(busqueda.toLowerCase());
        case "descripcion":
          return cat.descripcion && cat.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        default:
          return false;
      }
    });
    setCategoriasLista(filtradas);
  }, [categorias, busqueda, campoBusqueda]);

  const limpiarCampos = () => {
    setNombre("");
    setDescripcion("");
    setEditar(false);
    setId(undefined);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    limpiarCampos();
  };

  const abrirNuevaCategoria = () => {
    limpiarCampos();
    setMostrarModal(true);
  };

  const editarCategoria = (cat) => {
    setEditar(true);
    setId(cat.id);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion);
    setMostrarModal(true);
  };

  const procesarGuardado = async () => {
    if (nombre.trim() === "") {
      return toast.error("Por favor, complete el nombre de la categoría.");
    }
    
    try {
      let res;
      if (editar) {
        res = await apiFetch("/editarCategoria", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, nombre, descripcion })
        });
      } else {
        res = await apiFetch("/crearCategoria", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, descripcion })
        });
      }

      if (res.ok) {
        toast.success(editar ? "Categoría actualizada con éxito." : "Categoría registrada con éxito.");
        cerrarModal();
        fetchCategorias();
      } else {
        toast.error("Fallo al procesar la categoría.");
      }
    } catch (error) {
      toast.error("Error de red.");
    }
  };

  const deleteCategoria = async (catId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría? (Afectará a los productos asignados a ella)")) return;

    try {
      const res = await apiFetch(`/eliminarCategoria/${catId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Categoría eliminada con éxito.");
        fetchCategorias();
      } else {
        toast.error("Hubo un problema al eliminar la categoría.");
      }
    } catch (error) {
      toast.error("Error de red.");
    }
  };

  const totalCategorias = categoriasLista.length;
  const activas = categoriasLista.length; // Categorias no tienen estatus en la db actual, asumimos 100% activas
  const inactivas = 0;
  const activePercentage = totalCategorias ? 100 : 0;
  const conDescripcion = categoriasLista.filter(c => c.descripcion && c.descripcion.trim() !== "").length;

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Administración</span>
          <h1 className="admin-page-header__title">Gestión de categorías</h1>
          <p className="admin-page-header__text">
            Controla y gestiona las etiquetas para agrupar tus productos y listados dinámicamente.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button className="btn btn-success" onClick={abrirNuevaCategoria}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nueva categoría
          </button>
          {/* Falso botón de exportar PDF para coincidir con la UI */}
          <button className="btn btn-secondary">
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
            <FontAwesomeIcon icon={faTags} />
          </span>
          <span className="admin-stat-card__label">Categorías visibles</span>
          <strong className="admin-stat-card__value">{totalCategorias}</strong>
          <span className="admin-stat-card__meta">Resultados del filtro actual</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </span>
          <span className="admin-stat-card__label">Total Global</span>
          <strong className="admin-stat-card__value">{categorias.length}</strong>
          <span className="admin-stat-card__meta">Categorías en base de datos</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faFileAlt} />
          </span>
          <span className="admin-stat-card__label">Con Descripción</span>
          <strong className="admin-stat-card__value">{conDescripcion}</strong>
          <span className="admin-stat-card__meta">Registros con detalle</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faChartPie} />
          </span>
          <span className="admin-stat-card__label">Estado</span>
          <strong className="admin-stat-card__value">{activePercentage}%</strong>
          <span className="admin-stat-card__meta">Categorías activas del total</span>
        </article>
      </section>

      <section className="admin-panel-grid admin-panel-grid--users">
        <aside className="admin-side-card">
          <span className="admin-side-card__eyebrow">Visibilidad</span>
          <h3 className="admin-side-card__title">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Búsqueda y filtro
          </h3>
          <p className="admin-side-card__text">
            Cambia el campo de búsqueda y localiza categorías sin perder de vista el resumen general del módulo.
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
                <option value="nombre">Nombre</option>
                <option value="descripcion">Descripción</option>
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Término</span>
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
            
            <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#4FDBBE', letterSpacing: '0.5px' }}>ESTADO DEL PANEL</span>
               <h4 style={{ fontSize: '1.1rem', marginTop: '0.25rem', marginBottom: '0.25rem', fontWeight: 700 }}>Dashboard listo</h4>
               <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.4 }}>Usa el boton Nueva categoría o edita un registro desde la tabla.</p>
            </div>
          </div>
        </aside>

        <section className="admin-table-card">
          <div className="admin-table-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Listado</span>
              <h2 className="admin-table-card__title">
                <FontAwesomeIcon icon={faTags} className="me-2" />
                Categorías registradas
              </h2>
            </div>
            <span className="admin-table-card__count">{totalCategorias} resultados</span>
          </div>

          <div className="admin-table-wrap">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th scope="col"># ID</th>
                  <th scope="col">NOMBRE</th>
                  <th scope="col">DESCRIPCIÓN</th>
                  <th scope="col">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {categoriasLista.map((val) => (
                  <tr key={val.id}>
                    <th>{val.id}</th>
                    <td><strong>{val.nombre}</strong></td>
                    <td>{val.descripcion || "Sin descripción"}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          onClick={() => editarCategoria(val)}
                          className="btn btn-info admin-icon-button"
                          aria-label={`Editar ${val.nombre}`}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategoria(val.id)}
                          className="btn btn-danger admin-icon-button"
                          aria-label={`Eliminar ${val.nombre}`}
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
        </section>
      </section>

      <Modal
        show={mostrarModal}
        onHide={cerrarModal}
        centered
        size="md"
        dialogClassName="admin-modal"
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">
              {editar ? "Modo edición" : "Nuevo registro"}
            </span>
            <Modal.Title className="admin-modal__title">
              {editar ? "Actualizar categoría" : "Crear categoría"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Nombre</span>
              <input
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Nombre de la categoría"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span className="admin-field__label">Descripción</span>
              <input
                type="text"
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                className="form-control admin-field__control"
                placeholder="Descripción opcional"
              />
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer className="admin-modal__footer">
          {editar ? (
            <>
              <button className="btn btn-warning" onClick={procesarGuardado}>
                <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                Actualizar categoría
              </button>
              <button className="btn btn-danger" onClick={cerrarModal}>
                <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-success" onClick={procesarGuardado}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Crear categoría
              </button>
              <button className="btn admin-page-header__ghost" onClick={cerrarModal}>
                <FontAwesomeIcon icon={faRotateLeft} className="me-2" />
                Cerrar
              </button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </AdminShell>
  );
}

export default CategoriesPage;