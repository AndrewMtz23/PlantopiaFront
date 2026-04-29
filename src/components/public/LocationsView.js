import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faMapLocationDot,
  faPhone,
  faRoute,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { apiFetch } from "../../config/api";
import BranchMap from "../admin/BranchMap";
import PublicPageLayout from "./PublicPageLayout";
import "../css/PublicSite.css";

const hasLocation = (branch) => branch.latitud && branch.longitud;

const buildDirectionsUrl = (branch) => {
  if (!hasLocation(branch)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.direccion)}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${branch.latitud},${branch.longitud}`;
};

const LocationsView = () => {
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiFetch("/sucursalesPublicas")
      .then((response) => response.json())
      .then((data) => {
        if (isMounted) {
          setBranches(Array.isArray(data) ? data : []);
          setSelectedBranchId(data?.[0]?.id || null);
        }
      })
      .catch((error) => {
        console.error("Error al cargar sucursales publicas:", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBranches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return branches;
    }

    return branches.filter((branch) =>
      [branch.nombre, branch.direccion, branch.telefono]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [branches, searchTerm]);

  const selectedBranch =
    filteredBranches.find((branch) => Number(branch.id) === Number(selectedBranchId)) ||
    filteredBranches[0] ||
    null;

  return (
    <PublicPageLayout searchPlaceholder="Buscar sucursales...">
      <section className="public-page-hero public-page-hero--compact">
        <div className="public-shell public-page-hero__grid">
          <div>
            <span className="public-page-hero__eyebrow">Ubicaciones</span>
            <h1 className="public-page-hero__title">Encuentra tu sucursal Plantopia</h1>
            <p className="public-page-hero__copy">
              Consulta nuestras sedes activas, revisa el contacto directo y abre la ruta
              hacia la tienda que te quede mas cerca.
            </p>
          </div>
          <div className="public-location-summary">
            <span>
              <FontAwesomeIcon icon={faMapLocationDot} />
              {branches.length} sucursales activas
            </span>
            <strong>{filteredBranches.length}</strong>
            <p>coincidencias disponibles para visitar hoy</p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-shell public-location-layout">
          <aside className="public-location-panel">
            <label className="public-location-search">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, direccion o telefono"
              />
            </label>

            <div className="public-location-list">
              {isLoading ? (
                <div className="public-location-empty">Cargando sucursales...</div>
              ) : filteredBranches.length ? (
                filteredBranches.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    className={`public-location-card ${
                      Number(selectedBranch?.id) === Number(branch.id)
                        ? "public-location-card--active"
                        : ""
                    }`}
                    onClick={() => setSelectedBranchId(branch.id)}
                  >
                    <span className="public-location-card__icon">
                      <FontAwesomeIcon icon={faLocationDot} />
                    </span>
                    <span className="public-location-card__body">
                      <strong>{branch.nombre}</strong>
                      <small>{branch.direccion}</small>
                      <em>
                        <FontAwesomeIcon icon={faPhone} />
                        {branch.telefono}
                      </em>
                    </span>
                  </button>
                ))
              ) : (
                <div className="public-location-empty">No encontramos sucursales con ese filtro.</div>
              )}
            </div>
          </aside>

          <div className="public-location-map-card">
            <BranchMap
              branches={filteredBranches}
              selectedPosition={
                selectedBranch && hasLocation(selectedBranch)
                  ? { latitud: selectedBranch.latitud, longitud: selectedBranch.longitud }
                  : null
              }
              className="branch-map--public"
            />

            {selectedBranch && (
              <div className="public-location-selected">
                <div>
                  <span>Seleccionada</span>
                  <strong>{selectedBranch.nombre}</strong>
                  <p>{selectedBranch.direccion}</p>
                </div>
                <a
                  className="public-button public-button--primary"
                  href={buildDirectionsUrl(selectedBranch)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faRoute} />
                  Como llegar
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default LocationsView;
