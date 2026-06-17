

interface Props {
  pedidos: any[];
}

export default function ReportesClientes({ pedidos }: Props) {
  return (
    <div>
      <h2>👥 Reporte de Clientes</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Total Comprado</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.map((pedido, index) => (
            <tr key={index}>
              <td>{pedido.cliente?.nombre || "Consumidor Final"}</td>
              <td>{pedido.cliente?.telefono || "-"}</td>
              <td>Bs {pedido.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}