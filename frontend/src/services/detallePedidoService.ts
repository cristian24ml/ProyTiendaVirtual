const API_URL = "http://localhost:3001/detalle-pedido";

export const obtenerDetalles = async () => {
  const response = await fetch(API_URL);
  return await response.json();
};

export const obtenerDetallePorId = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`);
  return await response.json();
};

export const crearDetalle = async (detalle: any) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(detalle),
  });

  return await response.json();
};

export const actualizarDetalle = async (
  id: number,
  detalle: any
) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(detalle),
  });

  return await response.json();
};

export const eliminarDetalle = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return await response.json();
};