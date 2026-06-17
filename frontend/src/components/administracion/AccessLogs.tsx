import { useState, useEffect } from "react";
import { obtenerLogs } from "../../services/authService";

interface Props {
  token: string;
}

export default function AccessLogs({ token }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerLogs(token);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar logs de acceso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "20px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>📋 Bitácora / Logs de Acceso</h2>
        <button
          onClick={cargarLogs}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {loading ? "Actualizando..." : "🔄 Actualizar"}
        </button>
      </div>

      {error && <div style={{ color: "#b91c1c", backgroundColor: "#fee2e2", padding: "10px", borderRadius: "6px", marginBottom: "15px" }}>{error}</div>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#4b5563" }}>
              <th style={{ padding: "12px 8px" }}>Usuario</th>
              <th style={{ padding: "12px 8px" }}>Evento</th>
              <th style={{ padding: "12px 8px" }}>Dirección IP</th>
              <th style={{ padding: "12px 8px" }}>Navegador (Browser)</th>
              <th style={{ padding: "12px 8px" }}>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                  No hay registros de acceso.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 8px", fontWeight: 500 }}>
                  {log.usuario ? `${log.usuario.nombreCompleto} (${log.username})` : log.username}
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor:
                        log.evento === "ingreso"
                          ? "#d1fae5"
                          : log.evento === "salida"
                          ? "#f3f4f6"
                          : "#fee2e2",
                      color:
                        log.evento === "ingreso"
                          ? "#065f46"
                          : log.evento === "salida"
                          ? "#374151"
                          : "#991b1b",
                    }}
                  >
                    {log.evento === "ingreso"
                      ? "Ingreso"
                      : log.evento === "salida"
                      ? "Salida"
                      : "Intento Fallido"}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", color: "#4b5563" }}>{log.ip}</td>
                <td
                  style={{
                    padding: "12px 8px",
                    color: "#6b7280",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={log.browser}
                >
                  {log.browser}
                </td>
                <td style={{ padding: "12px 8px", color: "#4b5563" }}>
                  {new Date(log.fecha_hora).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
