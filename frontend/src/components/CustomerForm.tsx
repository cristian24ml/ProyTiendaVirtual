import { useState } from "react";

interface CustomerFormProps {
  onClose: () => void;
  onConfirm: (cliente: {
    nombre: string;
    telefono: string;
    correo: string;
    metodoPago: string;
  }) => void;
}

export default function CustomerForm({
  onClose,
  onConfirm,
}: CustomerFormProps) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  const handleSubmit = () => {
    onConfirm({
      nombre,
      telefono,
      correo,
      metodoPago,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "10px",
          width: "400px",
        }}
      >
        <h2>Datos del Cliente (Opcional)</h2>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
          }}
        />

        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
          Método de Pago
        </label>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: "#fff",
            outline: "none"
          }}
        >
          <option value="Efectivo">💵 Efectivo (Pago en tienda/entrega)</option>
          <option value="QR">📱 Pago con QR</option>
        </select>
        
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
            {/*para cerrar el formualrio*/}
          <button onClick={onClose}>
            Cancelar
          </button>

          <button onClick={handleSubmit}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}