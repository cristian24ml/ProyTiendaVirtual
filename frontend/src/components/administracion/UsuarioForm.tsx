import { useState, useEffect } from "react";
import { obtenerUsuarios, eliminarUsuario, registrarUsuario, obtenerCaptcha, actualizarUsuario } from "../../services/authService";

interface Props {
  token: string;
  currentUser: any;
}

export default function UsuarioForm({ token, currentUser }: Props) {
  // Form states
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState(3); // Default to Cliente (ID 3)
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Captcha states
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  // Grid/List states
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Confirmation overlay states
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState<any | null>(null);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerUsuarios(token);
      setUsuarios(data);
    } catch {
      setError("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const cargarCaptcha = async () => {
    try {
      const data = await obtenerCaptcha();
      setCaptchaQuestion(data.pregunta);
      setCaptchaToken(data.captchaToken);
      setCaptchaAnswer("");
    } catch {
      console.error("No se pudo cargar el captcha.");
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (editingUserId) {
      // MODO EDICIÓN
      if (!nombreCompleto || !username || !rolId) {
        alert("El nombre completo, nombre de usuario y rol son obligatorios.");
        return;
      }

      if (password) {
        const strength = evaluatePasswordStrength(password);
        if (strength.score < 2) {
          setError("Por seguridad, la contraseña nueva debe ser al menos Intermedia (letras y números) y de mínimo 8 caracteres.");
          return;
        }
      }

      try {
        await actualizarUsuario(
          editingUserId,
          {
            nombreCompleto,
            username,
            rolId,
            password: password.trim() ? password : undefined,
          },
          token
        );

        setSuccess(`Usuario "${username}" modificado exitosamente.`);
        setEditingUserId(null);
        setNombreCompleto("");
        setUsername("");
        setPassword("");
        setRolId(3);
        cargarUsuarios();
      } catch (err: any) {
        setError(err.message || "Error al modificar el usuario.");
      }
    } else {
      // MODO CREACIÓN
      // VALIDACION DE LOS CAMPOS AL REGISTRAR U NUEVO USUARIO (Admi, Vendedor)
      if (!nombreCompleto || !username || !password || !captchaAnswer) {
        alert("Todos los campos son obligatorios.");
        return;
      }
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombreCompleto.trim())) {
        setError("El nombre completo solo puede contener letras y espacios.");
        return;
      }

      if (nombreCompleto.trim().length < 5) {
        setError("El nombre completo debe tener al menos 5 caracteres.");
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError("El nombre de usuario solo puede contener letras, números y guion bajo (_).");
        return;
      }

      if (username.length < 4) {
        setError("El nombre de usuario debe tener al menos 4 caracteres.");
        return;
      }

      const strength = evaluatePasswordStrength(password);
      if (strength.score < 2) {
        setError("Por seguridad, la contraseña debe ser al menos Intermedia (letras y números) y de mínimo 8 caracteres.");
        return;
      }

      try {
        const res = await registrarUsuario({
          nombreCompleto,
          username,
          password,
          rolId,
          captchaAnswer,
          captchaToken,
        });

        setRegisteredUserData(res);
        setShowRegConfirm(true);

        setSuccess(`Usuario "${username}" creado y registrado exitosamente.`);
        setNombreCompleto("");
        setUsername("");
        setPassword("");
        setRolId(3);
        cargarUsuarios();
        cargarCaptcha();
      } catch (err: any) {
        setError(err.message || "Error al crear el usuario.");
        cargarCaptcha();
      }
    }
  };

  const handleEditClick = (usr: any) => {
    setEditingUserId(usr.id);
    setNombreCompleto(usr.nombreCompleto);
    setUsername(usr.username);
    setRolId(usr.rol?.id || 3);
    setPassword(""); // Se deja vacío para que sea opcional
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setNombreCompleto("");
    setUsername("");
    setPassword("");
    setRolId(3);
    setError("");
    setSuccess("");
  };

  const handleDeleteUser = async (id: number, uname: string) => {
    if (currentUser && currentUser.id === id) {
      alert("No puedes eliminar al usuario con el que tienes la sesión iniciada.");
      return;
    }
    if (editingUserId === id) {
      alert("No puedes eliminar al usuario que estás editando actualmente.");
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar al usuario "${uname}"?`)) return;

    try {
      await eliminarUsuario(id, token);
      alert("Usuario eliminado correctamente.");
      cargarUsuarios();
    } catch (err: any) {
      alert(err.message || "Error al eliminar usuario.");
    }
  };

  const strength = evaluatePasswordStrength(password);

  return (
    <div style={containerStyle}>
      {/* Formulario de registro */}
      <div style={formCardStyle}>
        <h2 style={{ margin: "0 0 20px 0" }}>{editingUserId ? "✏️ Modificar Usuario" : "👥 Crear Nuevo Usuario"}</h2>
        {error && <div style={errorAlertStyle}>{error}</div>}
        {success && <div style={successAlertStyle}>{success}</div>}

        <form onSubmit={handleCreateOrUpdateUser} style={formStyle}>
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

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Nombre de Usuario</label>
            <input
              type="text"
              placeholder="Ej. jperez"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

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

          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Contraseña {editingUserId && <span style={{ fontWeight: "normal", color: "#6b7280" }}>(dejar en blanco para no cambiar)</span>}
            </label>
            <input
              type="password"
              placeholder={editingUserId ? "•••••••• (opcional)" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required={!editingUserId}
            />
            {password && (
              <div style={{ display: "flex", flexDirection: "column", marginTop: "4px" }}>
                <div style={{ display: "flex", gap: "4px", height: "4px", marginBottom: "4px" }}>
                  <div style={{ flex: 1, borderRadius: "2px", backgroundColor: strength.score >= 1 ? strength.color : "#e5e7eb" }} />
                  <div style={{ flex: 1, borderRadius: "2px", backgroundColor: strength.score >= 2 ? strength.color : "#e5e7eb" }} />
                  <div style={{ flex: 1, borderRadius: "2px", backgroundColor: strength.score >= 3 ? strength.color : "#e5e7eb" }} />
                </div>
                <span style={{ fontSize: "12px", fontWeight: "600", color: strength.color }}>
                  Fortaleza: {strength.label}
                </span>
              </div>
            )}
          </div>

          {!editingUserId && (
            <div style={captchaGroupStyle}>
              <label style={labelStyle}>Seguridad (Captcha)</label>
              <div style={captchaContainerStyle}>
                <span style={{ fontWeight: "bold" }}>{captchaQuestion || "Cargando..."}</span>
                <button type="button" onClick={cargarCaptcha} style={{ background: "none", border: "none", cursor: "pointer" }}>🔄</button>
              </div>
              <input
                type="text"
                placeholder="Resultado"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          <button type="submit" style={submitButtonStyle}>
            {editingUserId ? "💾 Guardar Cambios" : "Registrar Usuario"}
          </button>

          {editingUserId && (
            <button type="button" onClick={handleCancelEdit} style={{ ...submitButtonStyle, backgroundColor: "#6b7280", marginTop: "0px" }}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Listado de usuarios */}
      <div style={listCardStyle}>
        <h3 style={{ margin: "0 0 20px 0" }}>Usuarios Registrados</h3>
        {loading ? (
          <div>Cargando lista de usuarios...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#4b5563", textAlign: "left" }}>
                  <th style={{ padding: "12px 8px" }}>Nombre Completo</th>
                  <th style={{ padding: "12px 8px" }}>Usuario</th>
                  <th style={{ padding: "12px 8px" }}>Rol</th>
                  <th style={{ padding: "12px 8px" }}>Clave</th>
                  <th style={{ padding: "12px 8px" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usr) => (
                  <tr key={usr.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 500 }}>{usr.nombreCompleto}</td>
                    <td style={{ padding: "12px 8px", color: "#6b7280" }}>{usr.username}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={getRolBadgeStyle(usr.rol?.nombre)}>
                        {usr.rol?.nombre || "Sin Rol"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 6px", borderRadius: "4px", ...getPasswordStrengthStyle(usr.nivelPassword) }}>
                        {usr.nivelPassword || "N/A"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleEditClick(usr)}
                          style={editButtonStyle}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUser(usr.id, usr.username)}
                          style={deleteButtonStyle}
                          disabled={currentUser && currentUser.id === usr.id}
                        >
                          ❌ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

// Estilos Helper
const getRolBadgeStyle = (rolName: string) => {
  let backgroundColor = "#e5e7eb";
  let color = "#374151";

  if (rolName === "Administrador") {
    backgroundColor = "#fee2e2";
    color = "#991b1b";
  } else if (rolName === "Vendedor") {
    backgroundColor = "#eff6ff";
    color = "#1e40af";
  } else if (rolName === "Cliente") {
    backgroundColor = "#ecfdf5";
    color = "#065f46";
  }

  return {
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600" as const,
    backgroundColor,
    color
  };
};

const getPasswordStrengthStyle = (level: string) => {
  if (level === "fuerte") return { backgroundColor: "#d1fae5", color: "#065f46" };
  if (level === "intermedia") return { backgroundColor: "#fef3c7", color: "#92400e" };
  return { backgroundColor: "#fee2e2", color: "#991b1b" };
};

// Estilos Premium (Vanilla CSS en JS)
const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: "30px",
  flexWrap: "wrap",
};

const formCardStyle: React.CSSProperties = {
  flex: "1 1 350px",
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const listCardStyle: React.CSSProperties = {
  flex: "1 1 500px",
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
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
  fontWeight: "600",
  color: "#4b5563",
};

const inputStyle: React.CSSProperties = {
  padding: "10px",
  fontSize: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  padding: "10px",
  fontSize: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  outline: "none",
  backgroundColor: "#fff",
};

const captchaGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  backgroundColor: "#f9fafb",
  padding: "12px",
  borderRadius: "8px",
  border: "1px dashed #d1d5db",
};

const captchaContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#e5e7eb",
  padding: "6px 10px",
  borderRadius: "6px",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "12px",
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "15px",
  cursor: "pointer",
  marginTop: "10px",
};
const deleteButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};

const editButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#2563eb",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};

const errorAlertStyle: React.CSSProperties = {
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  padding: "10px",
  borderRadius: "6px",
  fontSize: "13px",
  marginBottom: "15px",
  fontWeight: 500,
};

const successAlertStyle: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  color: "#047857",
  padding: "10px",
  borderRadius: "6px",
  fontSize: "13px",
  marginBottom: "15px",
  fontWeight: 500,
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
