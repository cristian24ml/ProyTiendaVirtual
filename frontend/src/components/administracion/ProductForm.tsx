import { useState, useEffect } from "react";
import { obtenerProductos, crearProducto, eliminarProducto, subirImagen, actualizarProducto } from "../../services/productoService";
import { obtenerCategorias } from "../../services/categoriaService";

export default function ProductForm() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagenUrl, setImagenUrl] = useState("/products/default.jpg");
  const [subiendoImg, setSubiendoImg] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarProductos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } catch {
      setError("Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSubiendoImg(true);
      try {
        const res = await subirImagen(file);
        setImagenUrl(res.url); // res.url returns e.g. "/products/1234567.png"
      } catch (err: any) {
        alert("Error al subir la imagen del producto: " + err.message);
      } finally {
        setSubiendoImg(false);
      }
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setPrecio("");
    setStock("");
    setCategoria("");
    setImagenUrl("/products/default.jpg");
    setEditId(null);
    const fileInput = document.getElementById("product-image-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEdit = (prod: any) => {
    setNombre(prod.nombre);
    setPrecio(String(prod.precio));
    setStock(String(prod.stock));
    setCategoria(String(prod.categoriaId || ""));
    setImagenUrl(prod.imagen || "/products/default.jpg");
    setEditId(prod.id);
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("Debe ingresar el nombre del producto");
      return;
    }
    if (!precio || Number(precio) <= 0) {
      alert("Debe ingresar un precio válido mayor a 0");
      return;
    }
    if (!stock || Number(stock) < 0) {
      alert("Debe ingresar un stock válido de 0 o más");
      return;
    }
    if (!categoria) {
      alert("Debe seleccionar una categoría");
      return;
    }

    try {
      const datosProducto = {
        nombre,
        precio: Number(precio),
        stock: Number(stock),
        categoriaId: Number(categoria),
        imagen: imagenUrl
      };

      if (editId) {
        await actualizarProducto(editId, datosProducto);
        alert("Producto actualizado correctamente");
      } else {
        await crearProducto(datosProducto);
        alert("Producto registrado correctamente");
      }
      
      limpiarFormulario();
      cargarProductos();
    } catch (err: any) {
      alert("Error al guardar producto: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este producto?")) return;

    try {
      await eliminarProducto(id);
      alert("Producto eliminado correctamente");
      cargarProductos();
    } catch {
      alert("Error al eliminar producto.");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Formulario */}
      <div style={formCardStyle}>
        <h2 style={{ margin: "0 0 20px 0" }}>{editId ? "✏️ Editar Producto" : "📦 Nuevo Producto"}</h2>
        <form onSubmit={guardarProducto} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Nombre del Producto</label>
            <input
              type="text"
              placeholder="Ej. Vaso Personalizado"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={rowStyle}>
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Precio (Bs)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Stock Inicial</label>
              <input
                type="number"
                placeholder="Cantidad"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={selectStyle}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Imagen del Producto (Subir Archivo)</label>
            <input
              id="product-image-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={inputStyle}
            />
            {subiendoImg && <span style={{ fontSize: "12px", color: "#2563eb", marginTop: "4px" }}>⏳ Subiendo imagen al servidor...</span>}
            {imagenUrl && (
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "#6b7280" }}>Vista previa de la imagen cargada:</span>
                <img
                  src={imagenUrl}
                  alt="Preview"
                  style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid #d1d5db" }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" style={{ ...submitButtonStyle, flex: 2 }}>
              {editId ? "💾 Guardar Cambios" : "Guardar Producto"}
            </button>
            {editId && (
              <button 
                type="button" 
                onClick={limpiarFormulario} 
                style={cancelButtonStyle}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listado */}
      <div style={listCardStyle}>
        <h3 style={{ margin: "0 0 20px 0" }}>Productos Registrados</h3>
        {error && <div style={{ color: "#b91c1c", marginBottom: "15px" }}>{error}</div>}
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#4b5563" }}>
                  <th style={{ padding: "10px 8px" }}>Producto</th>
                  <th style={{ padding: "10px 8px" }}>Precio</th>
                  <th style={{ padding: "10px 8px" }}>Stock</th>
                  <th style={{ padding: "10px 8px" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "15px", color: "#6b7280" }}>
                      No hay productos registrados.
                    </td>
                  </tr>
                )}
                {productos.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 500 }}>{prod.nombre}</td>
                    <td style={{ padding: "10px 8px", color: "#10b981", fontWeight: "bold" }}>
                      Bs {prod.precio}
                    </td>
                    <td style={{ padding: "10px 8px", color: prod.stock === 0 ? "#ef4444" : "#1f2937", fontWeight: 600 }}>
                      {prod.stock}
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <button onClick={() => handleEdit(prod)} style={editButtonStyle}>
                        ✏️ Editar
                      </button>
                      <span style={{ margin: "0 6px", color: "#d1d5db" }}>|</span>
                      <button onClick={() => handleDelete(prod.id)} style={deleteButtonStyle}>
                        ❌ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  gap: "15px",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "15px",
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

const cancelButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  backgroundColor: "#6b7280",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "15px",
  cursor: "pointer",
  marginTop: "10px",
};