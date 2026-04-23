import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateLeft,
  faBug,
  faCircleInfo,
  faFilter,
  faListCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import AdminShell from "./AdminShell";
import { apiFetch } from "../../config/api";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDateTime = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
};

const parseMetadata = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const getLevelTone = (level) => {
  const normalized = String(level || "").toLowerCase();

  if (normalized === "error") {
    return "danger";
  }

  if (normalized === "warning" || normalized === "warn") {
    return "warning";
  }

  if (normalized === "info") {
    return "info";
  }

  return "neutral";
};

const LogsView = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      }

      if (moduleFilter) {
        params.set("modulo", moduleFilter);
      }

      if (levelFilter) {
        params.set("nivel", levelFilter);
      }

      const response = await apiFetch(`/verLogs?${params.toString()}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudieron cargar los logs.");
      }

      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message || "No se pudieron cargar los logs.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, moduleFilter, levelFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const moduleOptions = useMemo(
    () => [...new Set(logs.map((item) => item.modulo).filter(Boolean))].sort(),
    [logs]
  );

  const stats = useMemo(() => {
    const errorLogs = logs.filter((item) => String(item.nivel).toLowerCase() === "error").length;
    const warningLogs = logs.filter((item) => String(item.nivel).toLowerCase() === "warning").length;

    return {
      total: logs.length,
      errorLogs,
      warningLogs,
      modules: new Set(logs.map((item) => item.modulo).filter(Boolean)).size,
    };
  }, [logs]);

  const openDetail = async (logId) => {
    setDetailOpen(true);
    setIsDetailLoading(true);
    setSelectedLog(null);

    try {
      const response = await apiFetch(`/verLog/${logId}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo cargar el detalle del log.");
      }

      const data = await response.json();
      setSelectedLog(data);
    } catch (detailError) {
      setSelectedLog({ error: detailError.message || "No se pudo cargar el detalle del log." });
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <AdminShell>
      <section className="admin-page-header">
        <div>
          <span className="admin-page-header__eyebrow">Auditoria</span>
          <h1 className="admin-page-header__title">Logs del sistema</h1>
          <p className="admin-page-header__text">
            Consulta la bitacora operativa del sistema para detectar eventos, errores y acciones registradas.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button type="button" className="btn btn-success" onClick={fetchLogs}>
            <FontAwesomeIcon icon={faArrowRotateLeft} className="me-2" />
            Recargar
          </button>
          <Link to="/cruds" className="btn admin-page-header__ghost">
            Volver al panel
          </Link>
        </div>
      </section>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faListCheck} />
          </span>
          <span className="admin-stat-card__label">Logs visibles</span>
          <strong className="admin-stat-card__value">{stats.total}</strong>
          <span className="admin-stat-card__meta">Eventos listados con los filtros actuales</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faBug} />
          </span>
          <span className="admin-stat-card__label">Errores</span>
          <strong className="admin-stat-card__value">{stats.errorLogs}</strong>
          <span className="admin-stat-card__meta">Entradas marcadas en nivel error</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </span>
          <span className="admin-stat-card__label">Warnings</span>
          <strong className="admin-stat-card__value">{stats.warningLogs}</strong>
          <span className="admin-stat-card__meta">Alertas registradas para seguimiento</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-card__icon">
            <FontAwesomeIcon icon={faCircleInfo} />
          </span>
          <span className="admin-stat-card__label">Modulos</span>
          <strong className="admin-stat-card__value">{stats.modules}</strong>
          <span className="admin-stat-card__meta">Origenes distintos presentes en la bitacora</span>
        </article>
      </section>

      <section className="admin-panel-grid admin-panel-grid--users">
        <aside className="admin-side-card">
          <span className="admin-side-card__eyebrow">Bitacora</span>
          <h3 className="admin-side-card__title">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Filtros de log
          </h3>
          <p className="admin-side-card__text">
            Busca por accion o descripcion, y luego afina por modulo y severidad.
          </p>

          <div className="admin-side-card__controls">
            <label className="admin-field">
              <span className="admin-field__label">Buscar</span>
              <input
                type="text"
                className="form-control admin-field__control"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Accion, descripcion o usuario"
                autoComplete="off"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Modulo</span>
              <select
                className="form-select admin-field__control"
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {moduleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Nivel</span>
              <select
                className="form-select admin-field__control"
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
              >
                <option value="">Todos</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </label>

            <button type="button" className="btn btn-light" onClick={fetchLogs}>
              Aplicar filtros
            </button>
          </div>
        </aside>

        <section className="admin-table-card">
          <div className="admin-table-card__header">
            <div>
              <span className="admin-table-card__eyebrow">Auditoria</span>
              <h2 className="admin-table-card__title">
                <FontAwesomeIcon icon={faListCheck} className="me-2" />
                Historial de logs
              </h2>
            </div>
            <span className="admin-table-card__count">{logs.length} resultados</span>
          </div>

          {isLoading ? (
            <div className="admin-analytics-loading">
              <Spinner animation="border" />
              <p className="mb-0">Cargando logs...</p>
            </div>
          ) : error ? (
            <div className="admin-analytics-empty">
              <p className="mb-0">{error}</p>
            </div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="table admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Modulo</th>
                      <th>Accion</th>
                      <th>Nivel</th>
                      <th>Usuario</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <th>{log.id}</th>
                        <td>{log.modulo}</td>
                        <td>{log.accion}</td>
                        <td>
                          <span className={`admin-tone-pill admin-tone-pill--${getLevelTone(log.nivel)}`}>
                            {log.nivel || "info"}
                          </span>
                        </td>
                        <td>{log.usuario_nombre || "Sistema"}</td>
                        <td>{formatDateTime(log.fechaRegistro)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-light admin-icon-button"
                            onClick={() => openDetail(log.id)}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-mobile-list">
                {logs.map((log) => (
                  <article className="admin-mobile-card" key={log.id}>
                    <div className="admin-mobile-card__header">
                      <div>
                        <span className="admin-mobile-card__eyebrow">Log #{log.id}</span>
                        <h3 className="admin-mobile-card__title">{log.accion}</h3>
                      </div>
                      <span className={`admin-tone-pill admin-tone-pill--${getLevelTone(log.nivel)}`}>
                        {log.nivel || "info"}
                      </span>
                    </div>
                    <div className="admin-mobile-card__grid">
                      <div className="admin-mobile-card__item">
                        <span className="admin-mobile-card__label">Modulo</span>
                        <strong>{log.modulo}</strong>
                      </div>
                      <div className="admin-mobile-card__item">
                        <span className="admin-mobile-card__label">Usuario</span>
                        <strong>{log.usuario_nombre || "Sistema"}</strong>
                      </div>
                      <div className="admin-mobile-card__item admin-mobile-card__item--wide">
                        <span className="admin-mobile-card__label">Descripcion</span>
                        <strong>{log.descripcion}</strong>
                      </div>
                    </div>
                    <div className="admin-mobile-card__actions">
                      <button
                        type="button"
                        className="btn btn-light admin-icon-button"
                        onClick={() => openDetail(log.id)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </section>

      <Modal
        show={detailOpen}
        onHide={() => setDetailOpen(false)}
        dialogClassName="admin-modal admin-modal--details"
        size="lg"
        centered
      >
        <Modal.Header closeButton className="admin-modal__header">
          <div>
            <span className="admin-editor-card__eyebrow">Detalle de log</span>
            <Modal.Title className="admin-modal__title">
              {selectedLog?.id ? `Log #${selectedLog.id}` : "Log"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="admin-modal__body">
          {isDetailLoading ? (
            <div className="admin-analytics-loading">
              <Spinner animation="border" />
              <p className="mb-0">Cargando detalle...</p>
            </div>
          ) : selectedLog?.error ? (
            <div className="admin-analytics-empty">
              <p className="mb-0">{selectedLog.error}</p>
            </div>
          ) : selectedLog?.id ? (
            <div className="admin-detail-grid">
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Modulo</span>
                <strong>{selectedLog.modulo}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Accion</span>
                <strong>{selectedLog.accion}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Nivel</span>
                <strong>{selectedLog.nivel}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Usuario</span>
                <strong>{selectedLog.usuario_nombre || "Sistema"}</strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Descripcion</span>
                <strong>{selectedLog.descripcion}</strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">Entidad</span>
                <strong>
                  {selectedLog.entidad || "Sin entidad"}
                  {selectedLog.entidadId ? ` #${selectedLog.entidadId}` : ""}
                </strong>
              </div>
              <div className="admin-detail-card">
                <span className="admin-detail-card__label">IP</span>
                <strong>{selectedLog.ip || "No registrada"}</strong>
              </div>
              <div className="admin-detail-card admin-detail-card--wide">
                <span className="admin-detail-card__label">Metadata</span>
                <pre className="admin-json-block">
                  {JSON.stringify(parseMetadata(selectedLog.metadata), null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </Modal.Body>
      </Modal>
    </AdminShell>
  );
};

export default LogsView;
