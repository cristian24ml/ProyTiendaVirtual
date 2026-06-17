import { useState, useEffect } from "react";
import { obtenerCategorias, crearCategoria, eliminarCategoria, actualizarCategoria } from "../../services/categoriaService";

export default function CategoryForm() {
  const [nombre, setNombre] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingCatId, setEditingCatId] = useState<number | null>(null);

  const cargarCategorias = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch {
      setError("Error al cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("Debe ingresar el nombre de la categoría");
      return;
    }

    try {
      if (editingCatId !== null) {
        await actualizarCategoria(editingCatId, { nombre });
        alert("Categoría actualizada con éxito.");
        setEditingCatId(null);
      } else {
        await crearCategoria({ nombre });
        alert("Categoría registrada con éxito.");
      }
      setNombre("");
      cargarCategorias(); // Refrescar la lista
    } catch (err: any) {
      alert(err.message || "Error al guardar la categoría.");
    }
  };

  const handleEdit = (cat: any) => {
    setNombre(cat.nombre);
    setEditingCatId(cat.id);
  };

  const handleCancel = () => {
    setNombre("");
    setEditingCatId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta categoría?")) return;

    try {
      await eliminarCategoria(id);
      alert("Categoría eliminada con éxito.");
      cargarCategorias();
    } catch {
      alert("No se pudo eliminar la categoría. Verifique si contiene productos asociados.");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Formulario */}
      <div style={formCardStyle}>
        <h2 style={{ margin: "0 0 15px 0" }}>
          {editingCatId !== null ? "✏️ Editar Categoría" : "📁 Nueva Categoría"}
        </h2>
        <form onSubmit={guardarCategoria} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
            required
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" style={{ ...submitButtonStyle, flex: 1, backgroundColor: editingCatId !== null ? "#3b82f6" : "#10b981" }}>
              {editingCatId !== null ? "💾 Guardar Cambios" : "Guardar Categoría"}
            </button>
            {editingCatId !== null && (
              <button type="button" onClick={handleCancel} style={{ ...cancelButtonStyle, flex: 1 }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listado */}
      <div style={listCardStyle}>
        <h3 style={{ margin: "0 0 15px 0" }}>Listado de Categorías</h3>
        {error && <div style={{ color: "#b91c1c", marginBottom: "10px" }}>{error}</div>}
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <ul style={listStyle}>
            {categorias.length === 0 && <li style={{ color: "#6b7280" }}>No hay categorías registradas.</li>}
            {categorias.map((cat) => (
              <li key={cat.id} style={listItemStyle}>
                <span>{cat.nombre}</span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleEdit(cat)} style={editButtonStyle}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(cat.id)} style={deleteButtonStyle}>
                    ❌ Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: "30px",
  flexWrap: "wrap",
};

const formCardStyle: React.CSSProperties = {
  flex: "1 1 300px",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const listCardStyle: React.CSSProperties = {
  flex: "1 1 400px",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const inputStyle: React.CSSProperties = {
  padding: "10px",
  fontSize: "15px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  outline: "none",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "10px 15px",
  backgroundColor: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 15px",
  backgroundColor: "#6b7280",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
};

const listStyle: React.CSSProperties = {
  listStyleType: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const listItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  backgroundColor: "#f9fafb",
  border: "1px solid #f3f4f6",
  borderRadius: "6px",
};

const editButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#3b82f6",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};

const deleteButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};