import { useState, useEffect } from "react";
import { obtenerPedidos, eliminarPedido, crearPedido } from "../../services/pedidoService";
import { obtenerProductos } from "../../services/productoService";
import { obtenerUsuarios } from "../../services/authService";
import { generarFacturaPDF } from "../../utils/pdfGenerator";

interface Props {
  token: string;
}

export default function PedidosAdmin({ token }: Props) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Control de vista: listado o formulario
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedQrPedido, setSelectedQrPedido] = useState<any | null>(null);

  // Estados del formulario de registro de pedido
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [usuarioId, setUsuarioId] = useState<number | "">("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  // Catálogos cargados
  const [productos, setProductos] = useState<any[]>([]);
  const [usuariosClientes, setUsuariosClientes] = useState<any[]>([]);

  // Carrito de ítems para el nuevo pedido
  const [items, setItems] = useState<any[]>([]);
  const [selectedProdId, setSelectedProdId] = useState<number | "">("");
  const [selectedQty, setSelectedQty] = useState<number>(1);

  const cargarPedidos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerPedidos(token);
      if (Array.isArray(data)) {
        // Ordenar pedidos por ID descendente para mostrar los más recientes arriba
        setPedidos(data.sort((a: any, b: any) => b.id - a.id));
      } else {
        setPedidos([]);
      }
    } catch {
      setError("Error al cargar la lista de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      // Cargar productos para selección
      const prods = await obtenerProductos();
      if (Array.isArray(prods)) {
        setProductos(prods);
      }

      // Cargar usuarios para opcionalmente asociar al pedido (tipo Cliente)
      const usrs = await obtenerUsuarios(token);
      if (Array.isArray(usrs)) {
        // Filtramos para asociar solo Clientes en el dropdown
        const clientes = usrs.filter((u: any) => u.rol?.nombre === "Cliente");
        setUsuariosClientes(clientes);
      }
    } catch (err: any) {
      console.error("Error al cargar catálogos en pedidos admin:", err);
    }
  };

  useEffect(() => {
    cargarPedidos();
    cargarCatalogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeletePedido = async (id: number) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente el Pedido #${id}?`)) return;

    try {
      await eliminarPedido(id, token);
      alert("Pedido eliminado correctamente.");
      cargarPedidos();
      cargarCatalogos(); // Refrescar stock de productos
    } catch (err: any) {
      alert(err.message || "Error al eliminar pedido.");
    }
  };

  // Agregar un producto al pedido actual de administración
  const handleAddItem = () => {
    if (selectedProdId === "") {
      alert("Por favor, seleccione un producto.");
      return;
    }
    if (selectedQty <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    const prod = productos.find((p) => p.id === Number(selectedProdId));
    if (!prod) return;

    // Verificar si el ítem ya está agregado para validar el stock total deseado
    const existingItem = items.find((item) => item.productoId === prod.id);
    const qtyInCart = existingItem ? existingItem.cantidad : 0;
    const totalQtyRequested = qtyInCart + selectedQty;

    if (prod.stock !== undefined && prod.stock < totalQtyRequested) {
      alert(`Stock insuficiente para ${prod.nombre}. (Stock disponible: ${prod.stock}, solicitado: ${totalQtyRequested})`);
      return;
    }

    const precio = Number(prod.precio);
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productoId === prod.id
            ? { ...item, cantidad: totalQtyRequested, subtotal: totalQtyRequested * precio }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productoId: prod.id,
          nombre: prod.nombre,
          precioUnitario: precio,
          cantidad: selectedQty,
          subtotal: selectedQty * precio,
        },
      ]);
    }

    // Resetear campos de selección de producto
    setSelectedProdId("");
    setSelectedQty(1);
  };

  // Eliminar un ítem de la lista temporal del pedido
  const handleRemoveItem = (prodId: number) => {
    setItems(items.filter((item) => item.productoId !== prodId));
  };

  // Calcular el total acumulado
  const totalPedido = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Registrar el pedido formalmente
  const handleRegisterPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (items.length === 0) {
      alert("Debe agregar al menos un artículo al pedido.");
      return;
    }

    const nuevoPedido = {
      nombreCompleto: nombreCompleto.trim() || "Consumidor Final",
      telefono: telefono.trim() || null,
      correo: correo.trim() || null,
      total: totalPedido,
      usuarioId: usuarioId !== "" ? Number(usuarioId) : undefined,
      metodoPago: metodoPago,
      detalles: items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        personalizacion: "",
      })),
    };

    try {
      const res = await crearPedido(nuevoPedido, token);
      setSuccess("¡Pedido administrativo registrado y stock descontado con éxito!");
      
      if (res.metodoPago === "QR") {
        setSelectedQrPedido(res);
      } else {
        try {
          await generarFacturaPDF(res);
        } catch (pdfErr) {
          console.error("Error al generar factura PDF:", pdfErr);
        }
      }

      
      // Limpiar formulario y carrito
      setNombreCompleto("");
      setTelefono("");
      setCorreo("");
      setUsuarioId("");
      setMetodoPago("Efectivo");
      setItems([]);
      setShowCreateForm(false);

      // Recargar pedidos y stock de productos
      cargarPedidos();
      cargarCatalogos();
    } catch (err: any) {
      setError(err.message || "Error al registrar el pedido administrativo.");
    }
  };

  // Al seleccionar un usuario de la lista, autocompletar sus datos si los tiene
  const handleUsuarioChange = (idVal: string) => {
    setUsuarioId(idVal !== "" ? Number(idVal) : "");
    if (idVal !== "") {
      const selectedUser = usuariosClientes.find((u) => u.id === Number(idVal));
      if (selectedUser) {
        setNombreCompleto(selectedUser.nombreCompleto || "");
        // Si tuviera otros datos los autocompletaríamos
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>📋 Registro de Ventas y Pedidos</h2>
          
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setError("");
              setSuccess("");
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: showCreateForm ? "#6b7280" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {showCreateForm ? "← Ver Pedidos" : "➕ Registrar Venta / Pedido"}
          </button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyleStyle}>{success}</div>}

        {showCreateForm ? (
          /* FORMULARIO DE REGISTRO DE PEDIDO     */
          <div style={formContainerStyle}>
            <h3 style={{ margin: "0 0 15px 0", color: "#1f2937" }}>📝 Nueva Venta / Pedido</h3>
            
            <form onSubmit={handleRegisterPedido} style={formLayoutGrid}>
              
              {/* Sección de Cliente */}
              <div style={formSectionStyle}>
                <h4 style={sectionTitleStyle}>👤 Datos del Cliente</h4>
                
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Vincular Usuario Registrado (Opcional)</label>
                  <select
                    value={usuarioId}
                    onChange={(e) => handleUsuarioChange(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">-- Cliente Invitado / No Registrado --</option>
                    {usuariosClientes.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombreCompleto} (@{u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Nombre del Cliente / Razón Social</label>
                  <input
                    type="text"
                    placeholder="Ej. Consumidor Final"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej. 70043210"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="Ej. cliente@gmail.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Método de Pago</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="Efectivo">💵 Efectivo (Pago en tienda)</option>
                    <option value="QR">📱 Pago QR</option>
                  </select>
                </div>
              </div>

              {/* Sección de Agregar Productos */}
              <div style={formSectionStyle}>
                <h4 style={sectionTitleStyle}>📦 Artículos del Pedido</h4>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "15px" }}>
                  <div style={{ ...inputGroupStyle, flex: "2 1 200px" }}>
                    <label style={labelStyle}>Seleccionar Producto</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(e.target.value !== "" ? Number(e.target.value) : "")}
                      style={selectStyle}
                    >
                      <option value="">-- Elija un Producto --</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.nombre} (Bs {Number(p.precio).toFixed(2)}) — Stock: {p.stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ ...inputGroupStyle, flex: "1 1 80px" }}>
                    <label style={labelStyle}>Cant.</label>
                    <input
                      type="number"
                      min={1}
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value)))}
                      style={inputStyle}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{
                      padding: "10px 15px",
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      height: "40px",
                    }}
                  >
                    ＋ Añadir
                  </button>
                </div>

                {/* Listado temporal de artículos añadidos */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Producto</th>
                        <th style={{ padding: "8px", textAlign: "center" }}>Cant.</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>P. Unit</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Subtotal</th>
                        <th style={{ padding: "8px", textAlign: "center" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}>
                            No ha añadido ningún producto todavía.
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => (
                          <tr key={item.productoId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "8px", fontWeight: "500" }}>{item.nombre}</td>
                            <td style={{ padding: "8px", textAlign: "center" }}>{item.cantidad}</td>
                            <td style={{ padding: "8px", textAlign: "right" }}>Bs {Number(item.precioUnitario).toFixed(2)}</td>
                            <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold" }}>Bs {Number(item.subtotal).toFixed(2)}</td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.productoId)}
                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px" }}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {items.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", padding: "10px", backgroundColor: "#ecfdf5", borderRadius: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: "#065f46" }}>Total Venta:</span>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: "#047857" }}>Bs {Number(totalPedido).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Botón de envío global */}
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#f3f4f6",
                    color: "#4b5563",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={items.length === 0}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: items.length === 0 ? "#9ca3af" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: items.length === 0 ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
                  }}
                >
                  Confirmar y Registrar Pedido
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* LISTADO DE PEDIDOS EXISTENTES */
          <div>
            {loading ? (
              <div>Cargando la lista de ventas...</div>
            ) : pedidos.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                No hay ningún pedido registrado en la base de datos.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {pedidos.map((ped) => (
                  <div key={ped.id} style={pedidoCardStyle}>
                    {/* Cabecera del pedido */}
                    <div style={pedidoHeaderStyle}>
                      <div>
                        <span style={pedidoTitleStyle}>Pedido #{ped.id}</span>
                        <span style={dateStyle}>
                          ({new Date(ped.fecha).toLocaleDateString()} {new Date(ped.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={totalStyle}>Bs {Number(ped.total).toFixed(2)}</span>
                        {ped.metodoPago === "QR" && (
                          <button onClick={() => setSelectedQrPedido(ped)} style={qrButtonStyle}>
                            📱 Ver QR
                          </button>
                        )}
                        <button onClick={async () => {
                          try {
                            await generarFacturaPDF(ped);
                          } catch (e) {
                            console.error(e);
                          }
                        }} style={invoiceButtonStyle}>
                          📄 Factura PDF
                        </button>

                        <button onClick={() => handleDeletePedido(ped.id)} style={deleteButtonStyle}>
                          ❌ Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Detalles del cliente */}
                    <div style={clientSectionStyle}>
                      <strong>Cliente:</strong> {ped.nombreCompleto || "Consumidor Final"} | 
                      <strong> Contacto:</strong> {ped.telefono || "N/A"} - {ped.correo || "N/A"} | 
                      <strong> Pago:</strong> {ped.metodoPago === "QR" ? "📱 QR" : "💵 Efectivo"} | 
                      <strong> Usuario Registrado:</strong> {ped.usuario ? `${ped.usuario.nombreCompleto} (@${ped.usuario.username})` : "Ninguno (Invitado)"}
                    </div>

                    {/* Desglose de artículos */}
                    <div style={itemsSectionStyle}>
                      <span style={{ fontWeight: "600", fontSize: "12px", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                        Detalle de Artículos:
                      </span>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#6b7280", textAlign: "left", fontSize: "12px" }}>
                            <th style={{ padding: "4px 8px" }}>Producto</th>
                            <th style={{ padding: "4px 8px", textAlign: "center" }}>Cantidad</th>
                            <th style={{ padding: "4px 8px", textAlign: "right" }}>Precio Unitario</th>
                            <th style={{ padding: "4px 8px", textAlign: "right" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ped.detalles && ped.detalles.map((det: any) => (
                            <tr key={det.id} style={{ borderBottom: "1px dashed #f3f4f6", fontSize: "13px" }}>
                              <td style={{ padding: "6px 8px", fontWeight: "500" }}>{det.producto?.nombre || "Producto"}</td>
                              <td style={{ padding: "6px 8px", textAlign: "center" }}>{det.cantidad}</td>
                              <td style={{ padding: "6px 8px", textAlign: "right" }}>Bs {Number(det.precioUnitario).toFixed(2)}</td>
                              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "600", color: "#2563eb" }}>
                                Bs {Number(det.subtotal || (det.precioUnitario * det.cantidad)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedQrPedido && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ margin: "0 0 15px 0", color: "var(--text-primary)" }}>📱 Código QR del Pedido #{selectedQrPedido.id}</h3>
            <p style={{ marginBottom: "15px", color: "var(--text-secondary)", fontSize: "14px" }}>
              Muestre este código al cliente para que realice el pago mediante QR:
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PagoElTallerDeLosDetalles_Pedido_${selectedQrPedido.id}_Total_${selectedQrPedido.total}`}
                alt="QR Code"
                style={{ border: "4px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", borderRadius: "8px" }}
              />
            </div>
            <p style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "20px", color: "var(--text-primary)" }}>
              Total a pagar: <span style={{ color: "#2563eb" }}>Bs {Number(selectedQrPedido.total).toFixed(2)}</span>
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setSelectedQrPedido(null)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
                }}
              >
                Cerrar
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
  width: "100%",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  border: "1px solid #eaeaea",
};

const errorStyle: React.CSSProperties = {
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  padding: "12px",
  borderRadius: "8px",
  fontSize: "14px",
  marginBottom: "20px",
  fontWeight: 500,
};

const successStyleStyle: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  color: "#047857",
  padding: "12px",
  borderRadius: "8px",
  fontSize: "14px",
  marginBottom: "20px",
  fontWeight: 500,
};

const formContainerStyle: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const formLayoutGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
};

const formSectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  backgroundColor: "#fff",
  padding: "18px",
  borderRadius: "8px",
  border: "1px solid #eaeaea",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 10px 0",
  fontSize: "14px",
  fontWeight: "700",
  color: "#374151",
  borderBottom: "2px solid #3b82f6",
  paddingBottom: "4px",
  display: "inline-block",
  alignSelf: "flex-start",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#4b5563",
};

const inputStyle: React.CSSProperties = {
  padding: "10px",
  fontSize: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  outline: "none",
  backgroundColor: "#fff",
};

const selectStyle: React.CSSProperties = {
  padding: "10px",
  fontSize: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  outline: "none",
  backgroundColor: "#fff",
};

const pedidoCardStyle: React.CSSProperties = {
  border: "1px solid #eaeaea",
  borderRadius: "10px",
  backgroundColor: "#f9fafb",
  overflow: "hidden",
};

const pedidoHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  backgroundColor: "#f3f4f6",
  borderBottom: "1px solid #eaeaea",
};

const pedidoTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#1e3a8a",
};

const dateStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  marginLeft: "8px",
};

const totalStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#059669",
};

const deleteButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};

const invoiceButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#2563eb",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};

const clientSectionStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: "13px",
  borderBottom: "1px dashed #eaeaea",
  color: "#374151",
  lineHeight: "1.4",
};

const itemsSectionStyle: React.CSSProperties = {
  padding: "12px 16px",
};

const modalBackdropStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-color)",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  maxWidth: "400px",
  width: "90%",
  textAlign: "center",
};

const qrButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#f59e0b",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
};

