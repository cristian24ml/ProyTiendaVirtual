


interface Props {
  onSelect: (option: string) => void;
  userRole: string;
}

export default function AdminMenu({ onSelect, userRole }: Props) {
  return (
    <div
      style={{
        width: "250px",
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h2 style={{ fontSize: "20px", margin: "0 0 10px 0", color: "#1f2937" }}>⚙ Administración</h2>

      <button
        style={btnStyle}
        onClick={() => onSelect("categoria")}
      >
        📁 Categorías
      </button>

      <button
        style={btnStyle}
        onClick={() => onSelect("producto")}
      >
        📦 Productos
      </button>

      <button
        style={btnStyle}
        onClick={() => onSelect("pedidos")}
      >
        📋 Pedidos Realizados
      </button>

      <button
        style={btnStyle}
        onClick={() => onSelect("reporte_mas_vendidos")}
      >
        📊 Productos Más Vendidos
      </button>


      {userRole === "Administrador" && (
        <button
          style={btnStyle}
          onClick={() => onSelect("usuarios")}
        >
          👥 Gestión de Usuarios
        </button>
      )}

      <button
        style={btnStyle}
        onClick={() => onSelect("logs")}
      >
        📋 Log de Accesos
      </button>

      <button
        style={{ ...btnStyle, backgroundColor: "#fee2e2", color: "#b91c1c", fontWeight: "bold", border: "1px solid #fee2e2", borderRadius: "8px", marginTop: "20px" }}
        onClick={() => onSelect("logout")}
      >
        🚪 Cerrar Sesión
      </button>
    </div>
  );
}

const btnStyle = {
  width: "100%",
  padding: "12px",
  cursor: "pointer",
  backgroundColor: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  textAlign: "left" as const,
  transition: "background-color 0.2s",
};