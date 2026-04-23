import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faLock,
  faRightToBracket,
  faSeedling,
  faShieldHeart,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../decoraciones/footer";
import logo from "../logos.png";
import "../css/Registro.css";
import "../css/Login.css";
import { apiFetch } from "../../config/api";
import { getSessionData, isAdminSession, isAuthenticated, saveSessionData } from "../../utils/session";
import PublicHeader from "../shared/PublicHeader";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginView() {
  const [clave, setClave] = useState("");
  const [correo, setCorreo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const sessionData = getSessionData();

  useEffect(() => {
    if (isAuthenticated(sessionData)) {
      navigate(isAdminSession(sessionData) ? "/cruds" : "/catalogo", { replace: true });
    }
  }, [navigate, sessionData]);

  const validateForm = () => {
    if (!correo.trim() || !clave) {
      return "Completa correo y contrasena.";
    }

    if (!EMAIL_REGEX.test(correo.trim().toLowerCase())) {
      return "Ingresa un correo electronico valido.";
    }

    return null;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          clave,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "No se pudo iniciar sesion.");
        return;
      }
      
      toast.success("¡Bienvenido a Plantopia!");

      saveSessionData({
        ...data.session,
        token: data.token,
      });

      const fallbackRoute = data.session?.tipo === 1 ? "/cruds" : "/catalogo";
      const redirectTarget = location.state?.from || fallbackRoute;
      navigate(redirectTarget, { replace: true });
    } catch (loginError) {
      console.error("Error de red:", loginError);
      toast.error("Error de red, intenta de nuevo mas tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="homepage registro-page login-page">
      <PublicHeader authMode backTo="/" backLabel="Regresar al sitio" />
      
      <div className="login-v2-container">
        <div className="login-v2-background">
          <img src="/fondo-flores.webp" alt="Background" />
          <div className="login-v2-overlay"></div>
        </div>

        <main className="login-v2-shell">
          <section className="login-v2-sidebar">
            <span className="login-v2-tag">¡De vuelta a casa!</span>
            <h1 className="login-v2-hero-title">
              Descubre <span>Nuevas Especies</span>
            </h1>
            <p className="login-v2-hero-copy">
              Inicia sesion para gestionar tus pedidos, contactar expertos en botánica y seguir explorando la magia de Plantopia.
            </p>

            <div className="login-v2-features">
              <div className="login-v2-feat-card">
                <FontAwesomeIcon icon={faShieldHeart} />
                <span>Explora la flora</span>
              </div>
              <div className="login-v2-feat-card">
                <FontAwesomeIcon icon={faShieldHeart} />
                <span>Tu cuenta está segura</span>
              </div>
              <div className="login-v2-feat-card">
                <FontAwesomeIcon icon={faSeedling} />
                <span>Tus favoritos te esperan</span>
              </div>
              <div className="login-v2-feat-card">
                <FontAwesomeIcon icon={faShieldHeart} />
                <span>Siéntete en casa</span>
              </div>
            </div>
          </section>

          <section className="login-v2-card-area">
            <div className="login-v2-form-card">
              <div className="login-v2-form-header">
                <div className="login-v2-logo-wrap">
                  <img src={logo} alt="Plantopia" />
                </div>
                <h2>¡Qué bueno verte!</h2>
                <p>Ingresa tus credenciales para continuar tu aventura en Plantopia</p>
              </div>

              <form onSubmit={handleLogin} className="login-v2-form">
                <div className="login-v2-field">
                  <label htmlFor="correo">CORREO ELECTRÓNICO</label>
                  <div className="login-v2-input-wrap">
                    <input
                      type="email"
                      id="correo"
                      placeholder="ejemplo@plantopia.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                </div>

                <div className="login-v2-field">
                  <label htmlFor="clave">CONTRASEÑA</label>
                  <div className="login-v2-input-wrap">
                    <input
                      type="password"
                      id="clave"
                      placeholder="**********"
                      value={clave}
                      onChange={(e) => setClave(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <Link to="#" className="login-v2-forgot">¿Olvidaste tu contraseña?</Link>
                </div>

                <button type="submit" className="login-v2-primary-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Ingresando..." : "Iniciar Sesion"}
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>

                <div className="login-v2-separator">
                  <span>O CONTINÚA CON</span>
                </div>

                <button type="button" className="login-v2-google-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Iniciar sesión con Google</span>
                </button>

                <div className="login-v2-footer">
                  <span>¿Aún no tienes cuenta? </span>
                  <Link to="/auth/register">Regístrate Hoy</Link>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default LoginView;
