import React, { useEffect, useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCity,
  faEnvelope,
  faHouse,
  faIdCard,
  faKey,
  faLocationDot,
  faLock,
  faRotateLeft,
  faSave,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import PublicHeader from "../shared/PublicHeader";
import RequireAuth from "../shared/RequireAuth";
import UserAvatar from "../shared/UserAvatar";
import Footer from "../decoraciones/footer";
import { getSessionData, saveSessionData } from "../../utils/session";
import "../css/Profile.css";

const emptyProfile = {
  nombre: "",
  fechaNacimiento: "",
  genero: "",
  telefono: "",
  correo: "",
  domicilio: "",
  ciudad: "",
  estadoDireccion: "",
  codigoPostal: "",
  referenciasDomicilio: "",
  fotoPerfil: "",
};

const ProfileView = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    claveActual: "",
    nuevaClave: "",
    confirmarClave: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await Axios.get("/perfil");
      setProfile(response.data.usuario || emptyProfile);
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.error || "No se pudo cargar tu perfil.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return undefined;
    }

    const preview = URL.createObjectURL(photoFile);
    setPhotoPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [photoFile]);

  const updateField = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append("nombre", profile.nombre);
    formData.append("fechaNacimiento", profile.fechaNacimiento);
    formData.append("genero", profile.genero);
    formData.append("telefono", profile.telefono);
    formData.append("correo", profile.correo);
    formData.append("domicilio", profile.domicilio);
    formData.append("ciudad", profile.ciudad || "");
    formData.append("estadoDireccion", profile.estadoDireccion || "");
    formData.append("codigoPostal", profile.codigoPostal || "");
    formData.append("referenciasDomicilio", profile.referenciasDomicilio || "");

    if (photoFile) {
      formData.append("fotoPerfil", photoFile);
    }

    try {
      const response = await Axios.put("/perfil", formData);
      const currentSession = getSessionData();
      const nextSession = {
        ...currentSession,
        ...response.data.session,
        token: currentSession?.token,
      };

      saveSessionData(nextSession);
      setProfile(response.data.usuario || profile);
      setPhotoFile(null);
      Swal.fire("Perfil actualizado", "Tus datos se guardaron correctamente.", "success");
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.error || "No se pudo actualizar tu perfil.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setIsChangingPassword(true);

    try {
      await Axios.put("/perfil/password", passwordForm);
      setPasswordForm({
        claveActual: "",
        nuevaClave: "",
        confirmarClave: "",
      });
      Swal.fire("Contrasena actualizada", "Tu acceso se actualizo correctamente.", "success");
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.error || "No se pudo cambiar la contrasena.", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <RequireAuth>
      <div className="profile-page">
        <PublicHeader />

        <main className="profile-shell">
          <section className="profile-hero">
            <div>
              <span className="profile-eyebrow">Cuenta Plantopia</span>
              <h1>Mi perfil</h1>
              <p>Actualiza tus datos principales, foto de perfil y datos de contacto para mantener tu cuenta al dia.</p>
            </div>
            <div className="profile-hero__summary">
              <UserAvatar
                imagePath={photoPreview || profile.fotoPerfil}
                name={profile.nombre}
                size={82}
              />
              <div>
                <strong>{profile.nombre || "Usuario Plantopia"}</strong>
                <span>{profile.correo || "correo pendiente"}</span>
              </div>
            </div>
          </section>

          <section className="profile-layout">
            <aside className="profile-card profile-card--side">
              <UserAvatar
                imagePath={photoPreview || profile.fotoPerfil}
                name={profile.nombre}
                size={132}
              />
              <label className="profile-photo-button">
                <FontAwesomeIcon icon={faCamera} />
                Cambiar foto
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                  onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
                />
              </label>
              <div className="profile-side-list">
                <span>
                  <FontAwesomeIcon icon={faUser} />
                  {Number(profile.tipo) === 1
                    ? "Administrador"
                    : Number(profile.tipo) === 3
                      ? "Empleado"
                      : Number(profile.tipo) === 4
                        ? "Repartidor"
                        : "Cliente"}
                </span>
                <span>
                  <FontAwesomeIcon icon={faEnvelope} />
                  {profile.correo || "Sin correo"}
                </span>
                <span>
                  <FontAwesomeIcon icon={faHouse} />
                  {profile.domicilio || "Sin domicilio"}
                </span>
                <span>
                  <FontAwesomeIcon icon={faCity} />
                  {[profile.ciudad, profile.estadoDireccion].filter(Boolean).join(", ") || "Sin ciudad"}
                </span>
                <span>
                  <FontAwesomeIcon icon={faLocationDot} />
                  {profile.codigoPostal ? `CP ${profile.codigoPostal}` : "Sin codigo postal"}
                </span>
              </div>
            </aside>

            <form className="profile-card profile-form" onSubmit={handleSubmit}>
              <div className="profile-form__header">
                <div>
                  <span className="profile-eyebrow">Datos personales</span>
                  <h2>Informacion de cuenta</h2>
                </div>
                <FontAwesomeIcon icon={faIdCard} />
              </div>

              {isLoading ? (
                <div className="profile-loading">Cargando perfil...</div>
              ) : (
                <div className="profile-form-grid">
                  <label className="profile-field profile-field--wide">
                    <span>Nombre completo</span>
                    <input
                      type="text"
                      value={profile.nombre || ""}
                      onChange={(event) => updateField("nombre", event.target.value)}
                      autoComplete="name"
                    />
                  </label>

                  <label className="profile-field">
                    <span>Fecha de nacimiento</span>
                    <input
                      type="date"
                      value={profile.fechaNacimiento || ""}
                      onChange={(event) => updateField("fechaNacimiento", event.target.value)}
                      autoComplete="bday"
                    />
                  </label>

                  <label className="profile-field">
                    <span>Genero</span>
                    <select
                      value={profile.genero || ""}
                      onChange={(event) => updateField("genero", event.target.value)}
                    >
                      <option value="">Selecciona una opcion</option>
                      <option value="MASCULINO">MASCULINO</option>
                      <option value="FEMENINO">FEMENINO</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </label>

                  <label className="profile-field">
                    <span>Telefono</span>
                    <input
                      type="tel"
                      value={profile.telefono || ""}
                      onChange={(event) => updateField("telefono", event.target.value)}
                      autoComplete="tel"
                    />
                  </label>

                  <label className="profile-field">
                    <span>Correo</span>
                    <input
                      type="email"
                      value={profile.correo || ""}
                      onChange={(event) => updateField("correo", event.target.value)}
                      autoComplete="email"
                    />
                  </label>

                  <label className="profile-field profile-field--wide">
                    <span>Calle y numero</span>
                    <input
                      type="text"
                      value={profile.domicilio || ""}
                      onChange={(event) => updateField("domicilio", event.target.value)}
                      autoComplete="street-address"
                    />
                  </label>

                  <label className="profile-field">
                    <span>Ciudad</span>
                    <input
                      type="text"
                      value={profile.ciudad || ""}
                      onChange={(event) => updateField("ciudad", event.target.value)}
                      autoComplete="address-level2"
                    />
                  </label>

                  <label className="profile-field">
                    <span>Estado</span>
                    <input
                      type="text"
                      value={profile.estadoDireccion || ""}
                      onChange={(event) => updateField("estadoDireccion", event.target.value)}
                      autoComplete="address-level1"
                    />
                  </label>

                  <label className="profile-field">
                    <span>Codigo postal</span>
                    <input
                      type="text"
                      value={profile.codigoPostal || ""}
                      onChange={(event) => updateField("codigoPostal", event.target.value.replace(/\D/g, ""))}
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="postal-code"
                    />
                  </label>

                  <label className="profile-field profile-field--wide">
                    <span>Referencias para entrega</span>
                    <textarea
                      value={profile.referenciasDomicilio || ""}
                      onChange={(event) => updateField("referenciasDomicilio", event.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Color de fachada, entre calles, instrucciones para encontrar tu casa..."
                    />
                  </label>
                </div>
              )}

              <div className="profile-form__actions">
                <button type="submit" className="profile-button profile-button--primary" disabled={isSaving || isLoading}>
                  <FontAwesomeIcon icon={faSave} />
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button type="button" className="profile-button" onClick={fetchProfile} disabled={isSaving}>
                  <FontAwesomeIcon icon={faRotateLeft} />
                  Restaurar
                </button>
              </div>
            </form>
          </section>

          <section className="profile-security-card profile-card">
            <div className="profile-form__header">
              <div>
                <span className="profile-eyebrow">Seguridad</span>
                <h2>Cambiar contrasena</h2>
              </div>
              <FontAwesomeIcon icon={faLock} />
            </div>

            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <div className="profile-form-grid">
                <label className="profile-field">
                  <span>Contrasena actual</span>
                  <input
                    type="password"
                    value={passwordForm.claveActual}
                    onChange={(event) => updatePasswordField("claveActual", event.target.value)}
                    autoComplete="current-password"
                  />
                </label>

                <label className="profile-field">
                  <span>Nueva contrasena</span>
                  <input
                    type="password"
                    value={passwordForm.nuevaClave}
                    onChange={(event) => updatePasswordField("nuevaClave", event.target.value)}
                    autoComplete="new-password"
                  />
                </label>

                <label className="profile-field">
                  <span>Confirmar nueva contrasena</span>
                  <input
                    type="password"
                    value={passwordForm.confirmarClave}
                    onChange={(event) => updatePasswordField("confirmarClave", event.target.value)}
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="profile-security-note">
                <FontAwesomeIcon icon={faKey} />
                <span>Usa al menos 8 caracteres. La nueva contrasena debe ser diferente a la actual.</span>
              </div>

              <div className="profile-form__actions">
                <button
                  type="submit"
                  className="profile-button profile-button--primary"
                  disabled={isChangingPassword}
                >
                  <FontAwesomeIcon icon={faLock} />
                  {isChangingPassword ? "Actualizando..." : "Actualizar contrasena"}
                </button>
              </div>
            </form>
          </section>
        </main>

        <Footer />
      </div>
    </RequireAuth>
  );
};

export default ProfileView;
