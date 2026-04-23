import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCalendarDays,
  faCheck,
  faCheckCircle,
  faEnvelope,
  faLock,
  faMapLocationDot,
  faPhone,
  faSeedling,
  faShieldHeart,
  faUser,
  faVenusMars,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../logos.png";
import "../css/Registro.css";
import { apiFetch } from "../../config/api";
import { getSessionData, isAdminSession, isAuthenticated } from "../../utils/session";
import PublicHeader from "../shared/PublicHeader";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10,15}$/;
const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

const initialFormData = {
  estatus: 1,
  tipo: 2,
  clave: "",
  nombre: "",
  fechaNacimiento: "",
  genero: "",
  telefono: "",
  correo: "",
  domicilio: "",
};

const STEP_META = {
  1: {
    title: "Crea tu cuenta",
    subtitle: "Comparte tus datos principales para empezar tu experiencia en Plantopia.",
  },
  2: {
    title: "Cuentanos de ti",
    subtitle: "Esto nos ayuda a personalizar mejor tu perfil y mantener tu cuenta al dia.",
  },
  3: {
    title: "Tu direccion",
    subtitle: "Necesitamos una ubicacion clara para facilitar futuras compras y envios.",
  },
};

const getPasswordChecks = (password) => ({
  minLength: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  specialChar: SPECIAL_CHAR_REGEX.test(password),
});

const getPasswordError = (password) => {
  const checks = getPasswordChecks(password);

  if (Object.values(checks).every(Boolean)) {
    return null;
  }

  return "La contrasena debe incluir minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial.";
};

const RegisterView = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const sessionData = getSessionData();
  const passwordChecks = getPasswordChecks(formData.clave);

  useEffect(() => {
    if (isAuthenticated(sessionData)) {
      navigate(isAdminSession(sessionData) ? "/cruds" : "/catalogo", { replace: true });
    }
  }, [navigate, sessionData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (formData.nombre.trim().length < 3) return "El nombre debe tener al menos 3 caracteres.";
      if (!EMAIL_REGEX.test(formData.correo.trim())) return "Ingresa un correo valido.";
      const passwordError = getPasswordError(formData.clave);
      if (passwordError) return passwordError;
    } else if (currentStep === 2) {
      if (!formData.fechaNacimiento) return "Selecciona tu fecha de nacimiento.";
      if (!formData.genero) return "Selecciona un genero.";
      if (!PHONE_REGEX.test(formData.telefono.replace(/\D/g, ""))) return "Telefono invalido (10-15 digitos).";
    } else if (currentStep === 3) {
      if (formData.domicilio.trim().length < 8) return "El domicilio debe ser mas especifico.";
    }

    return null;
  };

  const nextStep = () => {
    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validateStep(3);
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creando tu oasis...");

    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          correo: formData.correo.trim().toLowerCase(),
          nombre: formData.nombre.trim(),
          domicilio: formData.domicilio.trim(),
          telefono: formData.telefono.replace(/\D/g, ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Error al registrarse", { id: loadingToast });
        return;
      }

      toast.success("Bienvenido a Plantopia. Ya puedes iniciar sesion.", { id: loadingToast });
      navigate("/auth/login");
    } catch (error) {
      toast.error("Error de conexion", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registro-page">
      <PublicHeader authMode backTo="/" backLabel="Regresar al sitio" />

      <div className="registro-v2-container">
        <div className="registro-v2-background">
          <img src="/fondo-flores.webp" alt="Background" />
          <div className="registro-v2-overlay"></div>
        </div>

        <main className="registro-v2-shell">
          <section className="registro-v2-sidebar">
            <span className="registro-v2-tag">Plantopia Club</span>
            <h1 className="registro-v2-hero-title">
              Tu viaje botanico <span>Empieza Aqui</span>
            </h1>
            <p className="registro-v2-hero-copy">
              Unete a la comunidad de amantes de las plantas, guarda tus favoritas y compra con una experiencia clara y comoda en cualquier pantalla.
            </p>

            <div className="registro-v2-progress-panel">
              <div className="registro-v2-progress-copy">
                <span>Proceso de registro</span>
                <strong>Paso {step} de 3</strong>
              </div>
              <div className="registro-v2-steps-wrap" aria-hidden="true">
                <div className={`registro-v2-step-dot ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}></div>
                <div className={`registro-v2-step-dot ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}></div>
                <div className={`registro-v2-step-dot ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}></div>
              </div>
            </div>

            <div className="registro-v2-features">
              <div className="registro-v2-feat-card">
                <FontAwesomeIcon icon={faShieldHeart} />
                <span>Perfil seguro y privado</span>
              </div>
              <div className="registro-v2-feat-card">
                <FontAwesomeIcon icon={faSeedling} />
                <span>Favoritos y compras mas rapidas</span>
              </div>
              <div className="registro-v2-feat-card">
                <FontAwesomeIcon icon={faCheck} />
                <span>Registro en solo 3 pasos</span>
              </div>
              <div className="registro-v2-feat-card">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Diseno adaptado a movil</span>
              </div>
            </div>
          </section>

          <section className="registro-v2-card-area">
            <div className="registro-v2-form-card">
              <div className="registro-v2-form-header">
                <div className="registro-v2-logo-wrap">
                  <img src={logo} alt="Plantopia" />
                </div>
                <div className="registro-v2-step-pill">Paso {step} de 3</div>
                <h2>{STEP_META[step].title}</h2>
                <p>{STEP_META[step].subtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="registro-v2-form">
                {step === 1 && (
                  <div className="registro-v2-step-content">
                    <div className="registro-v2-field">
                      <label htmlFor="nombre">NOMBRE COMPLETO</label>
                      <div className="registro-v2-input-wrap">
                        <input
                          id="nombre"
                          type="text"
                          name="nombre"
                          placeholder="Ej. Juan Perez"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                        />
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    </div>

                    <div className="registro-v2-field">
                      <label htmlFor="correo">CORREO ELECTRONICO</label>
                      <div className="registro-v2-input-wrap">
                        <input
                          id="correo"
                          type="email"
                          name="correo"
                          placeholder="tu@correo.com"
                          value={formData.correo}
                          onChange={handleChange}
                          required
                        />
                        <FontAwesomeIcon icon={faEnvelope} />
                      </div>
                    </div>

                    <div className="registro-v2-field">
                      <label htmlFor="clave">CONTRASENA</label>
                      <div className="registro-v2-input-wrap">
                        <input
                          id="clave"
                          type="password"
                          name="clave"
                          placeholder="Minimo 8 caracteres"
                          value={formData.clave}
                          onChange={handleChange}
                          required
                        />
                        <FontAwesomeIcon icon={faLock} />
                      </div>
                      <div className="registro-v2-password-rules" aria-live="polite">
                        <span className={passwordChecks.minLength ? "is-valid" : ""}>8 caracteres minimo</span>
                        <span className={passwordChecks.uppercase ? "is-valid" : ""}>1 mayuscula</span>
                        <span className={passwordChecks.lowercase ? "is-valid" : ""}>1 minuscula</span>
                        <span className={passwordChecks.number ? "is-valid" : ""}>1 numero</span>
                        <span className={passwordChecks.specialChar ? "is-valid" : ""}>1 caracter especial</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="registro-v2-step-content">
                    <div className="registro-v2-field">
                      <label htmlFor="fechaNacimiento">FECHA DE NACIMIENTO</label>
                      <div className="registro-v2-input-wrap">
                        <input
                          id="fechaNacimiento"
                          type="date"
                          name="fechaNacimiento"
                          value={formData.fechaNacimiento}
                          onChange={handleChange}
                          required
                        />
                        <FontAwesomeIcon icon={faCalendarDays} />
                      </div>
                    </div>

                    <div className="registro-v2-field">
                      <label htmlFor="genero">GENERO</label>
                      <div className="registro-v2-input-wrap">
                        <select id="genero" name="genero" value={formData.genero} onChange={handleChange} required>
                          <option value="">Selecciona una opcion</option>
                          <option value="MASCULINO">Masculino</option>
                          <option value="FEMENINO">Femenino</option>
                          <option value="OTRO">Otro</option>
                        </select>
                        <FontAwesomeIcon icon={faVenusMars} />
                      </div>
                    </div>

                    <div className="registro-v2-field">
                      <label htmlFor="telefono">TELEFONO</label>
                      <div className="registro-v2-input-wrap">
                        <input
                          id="telefono"
                          type="tel"
                          name="telefono"
                          placeholder="10 digitos"
                          value={formData.telefono}
                          onChange={handleChange}
                          required
                        />
                        <FontAwesomeIcon icon={faPhone} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="registro-v2-step-content">
                    <div className="registro-v2-field">
                      <label htmlFor="domicilio">DOMICILIO COMPLETO</label>
                      <div className="registro-v2-input-wrap">
                        <input
                          id="domicilio"
                          type="text"
                          name="domicilio"
                          placeholder="Calle, numero, colonia, ciudad"
                          value={formData.domicilio}
                          onChange={handleChange}
                          required
                        />
                        <FontAwesomeIcon icon={faMapLocationDot} />
                      </div>
                    </div>

                    <div className="registro-v2-disclaimer">
                      <p>Al hacer clic en "Finalizar registro", aceptas nuestros terminos y condiciones botanicos.</p>
                    </div>
                  </div>
                )}

                <div className="registro-v2-actions">
                  {step > 1 && (
                    <button type="button" className="registro-v2-btn registro-v2-btn-prev" onClick={prevStep}>
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Atras
                    </button>
                  )}

                  {step < 3 ? (
                    <button type="button" className="registro-v2-btn registro-v2-btn-next" onClick={nextStep}>
                      Siguiente
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  ) : (
                    <button type="submit" className="registro-v2-btn registro-v2-btn-next" disabled={isSubmitting}>
                      {isSubmitting ? "Procesando..." : "Finalizar registro"}
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                  )}
                </div>
              </form>

              <div className="registro-v2-footer">
                Ya tienes cuenta? <Link to="/auth/login">Inicia sesion</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RegisterView;
