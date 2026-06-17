import { useState, useEffect } from "react";
import { obtenerProductosMasVendidos } from "../../services/pedidoService";

interface Props {
  token: string;
}

interface ProductoMasVendido {
  nombre: string;
  totalVendido: number;
}

export default function ReporteMasVendidos({ token }: Props) {
  const [data, setData] = useState<ProductoMasVendido[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [animate, setAnimate] = useState<boolean>(false);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    setAnimate(false);
    try {
      const result = await obtenerProductosMasVendidos(token);
      if (Array.isArray(result)) {
        setData(result);
        // Trigger growing animation after a minor delay
        setTimeout(() => setAnimate(true), 150);
      } else {
        setError("La respuesta del servidor no tiene el formato correcto.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar el reporte de más vendidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate stats for KPIs
  const maxSales = data.length > 0 ? Math.max(...data.map(d => d.totalVendido)) : 0;
  const totalSalesCount = data.reduce((sum, d) => sum + d.totalVendido, 0);
  const topProduct = data.length > 0 ? data[0] : null;

  return (
    <div style={{
      padding: "24px",
      backgroundColor: "var(--bg-secondary)",
      color: "var(--text-primary)",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
      transition: "background-color 0.3s ease, border-color 0.3s ease"
    }}>
      {/* Header Section */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
            📊 Productos Más Vendidos
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Visualización estadística de ventas acumuladas por producto.
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.2s"
          }}
        >
          {loading ? "Cargando..." : "🔄 Actualizar"}
        </button>
      </div>

      {error && (
        <div style={{
          color: "#b91c1c",
          backgroundColor: "#fee2e2",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #fca5a5",
          fontSize: "14px"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards Section */}
      {!loading && data.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }}>
          <div style={kpiCardStyle}>
            <span style={kpiLabelStyle}>Producto ⭐</span>
            <span style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#f59e0b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              display: "block",
              marginTop: "4px"
            }}>
              {topProduct?.nombre}
            </span>
          </div>
          <div style={kpiCardStyle}>
            <span style={kpiLabelStyle}>📦</span>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#2563eb", marginTop: "4px" }}>
              {topProduct?.totalVendido} <span style={{ fontSize: "14px", fontWeight: "normal", color: "var(--text-secondary)" }}>unidades</span>
            </span>
          </div>
          <div style={kpiCardStyle}>
            <span style={kpiLabelStyle}>Total Vendido 📈</span>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
              {totalSalesCount} <span style={{ fontSize: "14px", fontWeight: "normal", color: "var(--text-secondary)" }}>unidades</span>
            </span>
          </div>
        </div>
      )}

      {/* Chart & Details section */}
      {loading ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 0",
          color: "var(--text-secondary)"
        }}>
          <div className="spinner" style={spinnerStyle}></div>
          <p style={{ marginTop: "16px", fontWeight: "500" }}>Generando gráfica de barras...</p>
        </div>
      ) : data.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-secondary)",
          backgroundColor: "rgba(0, 0, 0, 0.02)",
          borderRadius: "8px",
          border: "1px dashed var(--border-color)"
        }}>
          <span style={{ fontSize: "48px" }}>📦</span>
          <h3 style={{ marginTop: "16px", fontWeight: "600", color: "var(--text-primary)" }}>No hay datos de ventas</h3>
          <p style={{ fontSize: "14px", marginTop: "4px" }}>Los pedidos completados con detalles de productos aparecerán aquí.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {data.map((item, index) => {
            const percentageOfMax = maxSales > 0 ? (item.totalVendido / maxSales) * 100 : 0;

            // Premium Harmonious Colors based on rank
            const hue = 220 - index * 18; // Hue shift from blue to violet/magenta
            const barGradient = `linear-gradient(90deg, hsl(${hue}, 85%, 65%), hsl(${hue - 15}, 85%, 50%))`;
            const shadowColor = `rgba(37, 99, 235, 0.15)`;

            return (
              <div key={index} style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}>
                {/* Product Meta: Name and count */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: index === 0 ? "#fef3c7" : "rgba(0, 0, 0, 0.05)",
                      color: index === 0 ? "#b45309" : "var(--text-secondary)"
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>{item.nombre}</span>
                  </div>
                  <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>
                    {item.totalVendido} {item.totalVendido === 1 ? 'unidad' : 'unidades'}
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div style={{
                  height: "28px",
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  borderRadius: "6px",
                  overflow: "hidden",
                  position: "relative",
                  border: "1px solid var(--border-color)"
                }}>
                  {/* Dynamic Colored Bar */}
                  <div
                    style={{
                      height: "100%",
                      width: animate ? `${percentageOfMax}%` : "0%",
                      background: barGradient,
                      borderRadius: "5px",
                      boxShadow: `0 3px 6px ${shadowColor}`,
                      transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: "10px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold"
                    }}
                  >
                    {animate && percentageOfMax > 15 && `${Math.round(percentageOfMax)}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inline Styles for Premium Elements
const kpiCardStyle: React.CSSProperties = {
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  border: "1px solid var(--border-color)",
  borderRadius: "10px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.05)"
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "var(--text-secondary)"
};

const spinnerStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  border: "3px solid var(--border-color)",
  borderTop: "3px solid #2563eb",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

// CSS Keyframes Injection for Spinner
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
