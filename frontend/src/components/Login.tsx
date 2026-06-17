import { useState, useEffect } from "react";
import { obtenerCaptcha, login, registrarUsuario } from "../services/authService";

interface Props {
  onLoginSuccess: (token: string, user: any) => void;
  onBack: () => void;
}

export default function Login({ onLoginSuccess, onBack }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [rolId, setRolId] = useState(3); // Default to Cliente (ID 3)

  // Captcha fields
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Database Confirmation state
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState<any | null>(null);

  const cargarCaptcha = async () => {
    try {
      setError("");
      const data = await obtenerCaptcha();
      setCaptchaQuestion(data.pregunta);
      setCaptchaToken(data.captchaToken);
      setCaptchaAnswer("");
    } catch {
      setError("No se pudo cargar el captcha.");
    }
  };

  useEffect(() => {
    cargarCaptcha();
  }, []);

  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Ninguna", color: "#e5e7eb" };
    if (pass.length < 8) return { score: 1, label: "Débil", color: "#ef4444" };

    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (hasLower && hasUpper && hasNumber && hasSpecial) {
      return { score: 3, label: "Fuerte", color: "#10b981" };
    }
    if ((hasLower || hasUpper) && hasNumber) {
      return { score: 2, label: "Intermedia", color: "#f59e0b" };
    }
    return { score: 1, label: "Débil", color: "#ef4444" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isLogin) {
      if (!username || !password || !captchaAnswer) {
        setError("Todos los campos son obligatorios.");
        return;
      }
      setLoading(true);
      try {
        const data = await login({
          username,
          password,
          captchaAnswer,
          captchaToken,
        });
        onLoginSuccess(data.access_token, data.usuario);
      } catch (err: any) {
        setError(err.message || "Error al iniciar sesión.");
        cargarCaptcha(); // Refrescar captcha en caso de error
      } finally {
        setLoading(false);
      }
    } else {
      if (!nombreCompleto || !username || !password || !captchaAnswer) {
        setError("Todos los campos son obligatorios.");
        return;
      }
      const strength = evaluatePasswordStrength(password);
      if (strength.score < 2) {
        setError("Por seguridad, la contraseña debe ser al menos Intermedia (letras y números) y de mínimo 8 caracteres.");
        return;
      }
      
      setLoading(true);
      try {
        const res = await registrarUsuario({
          nombreCompleto,
          username,
          password,
          rolId,
          captchaAnswer,
          captchaToken,
        });
        
        // Save registered user details returned by backend DB
        setRegisteredUserData(res);
        setShowRegConfirm(true);

        setSuccess(`¡Usuario "${username}" registrado con éxito en la base de datos!`);
        setIsLogin(true);
        // Clear sensitive / registration specific fields
        setPassword("");
        setCaptchaAnswer("");
        cargarCaptcha();
      } catch (err: any) {
        setError(err.message || "Error al registrar usuario.");
        cargarCaptcha();
      } finally {
        setLoading(false);
      }
    }
  };

  const strength = evaluatePasswordStrength(password);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoHeaderStyle}>
          <span style={logoIconStyle}>🎁</span>
          <h1 style={logoTitleStyle}>El Taller de los Detalles</h1>
          <p style={logoTaglineStyle}>Artículos de Recuerdos, Estampados y Manualidades Especiales</p>
        </div>

        <div style={tabsStyle}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
            style={isLogin ? activeTabStyle : tabStyle}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
            style={!isLogin ? activeTabStyle : tabStyle}
          >
            Registrarse
          </button>
        </div>

        <h2 style={titleStyle}>{isLogin ? "🔑 Acceso al Sistema" : "👤 Registro de Usuario"}</h2>
        <p style={subtitleStyle}>
          {isLogin
            ? "Ingresa tus credenciales y resuelve el captcha"
            : "Completa el formulario para registrar un nuevo perfil"}
        </p>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          {!isLogin && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Usuario</label>
            <input
              type="text"
              placeholder="Ej. jperez"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {!isLogin && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Rol del Usuario</label>
              <select
                value={rolId}
                onChange={(e) => setRolId(Number(e.target.value))}
                style={selectStyle}
                required
              >
                <option value={3}>Cliente</option>
                <option value={2}>Vendedor</option>
                <option value={1}>Administrador</option>
              </select>
            </div>
          )}

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />

            {!isLogin && password && (
              <div style={strengthMeterContainerStyle}>
                <div style={strengthBarContainerStyle}>
                  <div style={{ ...strengthBarStyle, backgroundColor: strength.score >= 1 ? strength.color : "#e5e7eb" }} />
                  <div style={{ ...strengthBarStyle, backgroundColor: strength.score >= 2 ? strength.color : "#e5e7eb" }} />
                  <div style={{ ...strengthBarStyle, backgroundColor: strength.score >= 3 ? strength.color : "#e5e7eb" }} />
                </div>
                <span style={{ ...strengthTextStyle, color: strength.color }}>
                  Fortaleza: {strength.label}
                </span>
                <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                  (Debe ser Intermedia o Fuerte, mín. 8 caracteres con letras y números)
                </span>
              </div>
            )}
          </div>

          <div style={captchaGroupStyle}>
            <label style={labelStyle}>Verificación de Seguridad</label>
            <div style={captchaContainerStyle}>
              <span style={captchaQuestionStyle}>{captchaQuestion || "Cargando..."}</span>
              <button
                type="button"
                onClick={cargarCaptcha}
                style={refreshButtonStyle}
                title="Recargar captcha"
              >
                🔄
              </button>
            </div>
            <input
              type="text"
              placeholder="Respuesta al captcha"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={submitButtonStyle}
          >
            {loading
              ? isLogin
                ? "Iniciando sesión..."
                : "Registrando..."
              : isLogin
              ? "Ingresar"
              : "Registrarse"}
          </button>
        </form>

        <button onClick={onBack} style={backButtonStyle}>
          ← Volver a la tienda
        </button>
      </div>

      {/* CONFIRMACION DE REGISTRO EN BASE DE DATOS */}
      {showRegConfirm && registeredUserData && (
        <div style={confirmOverlayStyle}>
          <div style={confirmContentStyle}>
            <div style={confirmHeaderStyle}>
              <span style={{ fontSize: "28px" }}>💾</span>
              <h3 style={confirmTitleStyle}>Registro Confirmado en BD</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                Los datos se han persistido y encriptado correctamente en MariaDB/MySQL.
              </p>
            </div>
            
            <div style={confirmBodyStyle}>
              <div style={confirmRowStyle}>
                <span style={confirmLabelStyle}>ID Autogenerado (MySQL)</span>
                <span style={confirmValueStyle}>#{registeredUserData.id}</span>
              </div>
              <div style={confirmRowStyle}>
                <span style={confirmLabelStyle}>Nombre Completo</span>
                <span style={confirmValueStyle}>{registeredUserData.nombreCompleto}</span>
              </div>
              <div style={confirmRowStyle}>
                <span style={confirmLabelStyle}>Nombre de Usuario</span>
                <span style={confirmValueStyle}>@{registeredUserData.username}</span>
              </div>
              <div style={confirmRowStyle}>
                <span style={confirmLabelStyle}>Seguridad de Clave</span>
                <span style={{ 
                  ...confirmValueStyle, 
                  color: registeredUserData.nivelPassword === 'fuerte' ? '#10b981' : registeredUserData.nivelPassword === 'intermedia' ? '#f59e0b' : '#ef4444',
                  fontWeight: 'bold' 
                }}>
                  {(registeredUserData.nivelPassword || 'Ninguna').toUpperCase()}
                </span>
              </div>
              <div style={confirmRowStyle}>
                <span style={confirmLabelStyle}>Método de Encriptación</span>
                <span style={confirmValueStyle}>PBKDF2 (SHA-512) + Salt</span>
              </div>
              <div style={confirmRowStyle}>
                <span style={confirmLabelStyle}>Estado de Conexión</span>
                <span style={{ ...confirmValueStyle, color: '#10b981', fontWeight: 'bold' }}>● ONLINE</span>
              </div>
            </div>
            
            <div style={confirmFooterStyle}>
              <button 
                onClick={() => { setShowRegConfirm(false); setRegisteredUserData(null); }} 
                style={confirmButtonStyle}
              >
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos Premium (Vanilla CSS en JS)
const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  width: "100vw",
  backgroundColor: "#f3f4f6",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "20px 0",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#ffffff",
  padding: "28px",
  borderRadius: "16px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
};

const logoHeaderStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "20px",
};

const logoIconStyle: React.CSSProperties = {
  fontSize: "40px",
  display: "block",
  marginBottom: "8px",
};

const logoTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#1e3a8a",
  margin: "0 0 4px 0",
};

const logoTaglineStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#4b5563",
  margin: 0,
  lineHeight: "1.4",
};

const tabsStyle: React.CSSProperties = {
  display: "flex",
  borderBottom: "2px solid #e5e7eb",
  marginBottom: "20px",
};

const tabStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px",
  textAlign: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  color: "#9ca3af",
  transition: "all 0.2s",
  borderBottom: "2px solid transparent",
  marginBottom: "-2px",
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: "#2563eb",
  borderBottom: "2px solid #2563eb",
};

const titleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#111827",
  textAlign: "center",
  margin: "0 0 4px 0",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  textAlign: "center",
  margin: "0 0 20px 0",
};

const errorStyle: React.CSSProperties = {
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  padding: "12px",
  borderRadius: "8px",
  fontSize: "13px",
  marginBottom: "16px",
  textAlign: "center",
  fontWeight: "500",
};

const successStyle: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  color: "#047857",
  padding: "12px",
  borderRadius: "8px",
  fontSize: "13px",
  marginBottom: "16px",
  textAlign: "center",
  fontWeight: "500",
  border: "1px solid #a7f3d0",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  outline: "none",
  transition: "border-color 0.2s",
};

const selectStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  outline: "none",
  backgroundColor: "#ffffff",
  cursor: "pointer",
};

const strengthMeterContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginTop: "4px",
};

const strengthBarContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "4px",
  height: "5px",
  marginBottom: "4px",
};

const strengthBarStyle: React.CSSProperties = {
  flex: 1,
  borderRadius: "2px",
  transition: "background-color 0.3s",
};

const strengthTextStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
};

const captchaGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  backgroundColor: "#f9fafb",
  padding: "12px",
  borderRadius: "10px",
  border: "1px dashed #d1d5db",
};

const captchaContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#e5e7eb",
  padding: "8px 12px",
  borderRadius: "6px",
};

const captchaQuestionStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "bold",
  color: "#1f2937",
};

const refreshButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "15px",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "12px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "8px",
  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
};

const backButtonStyle: React.CSSProperties = {
  padding: "10px",
  backgroundColor: "transparent",
  color: "#4b5563",
  border: "none",
  fontSize: "13px",
  cursor: "pointer",
  marginTop: "12px",
  textDecoration: "underline",
};

const confirmOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  zIndex: 99999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backdropFilter: 'blur(5px)'
};

const confirmContentStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  width: '90%',
  maxWidth: '400px',
  borderRadius: '16px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
};

const confirmHeaderStyle: React.CSSProperties = {
  padding: '24px',
  textAlign: 'center',
  borderBottom: '1px solid #f3f4f6',
  backgroundColor: '#f9fafb'
};

const confirmTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#065f46',
  margin: '8px 0 0 0'
};

const confirmBodyStyle: React.CSSProperties = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const confirmRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '13px'
};

const confirmLabelStyle: React.CSSProperties = {
  color: '#6b7280',
  fontWeight: '500'
};

const confirmValueStyle: React.CSSProperties = {
  color: '#1f2937',
  fontWeight: '600'
};

const confirmFooterStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderTop: '1px solid #f3f4f6',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#f9fafb'
};

const confirmButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#059669',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
};

