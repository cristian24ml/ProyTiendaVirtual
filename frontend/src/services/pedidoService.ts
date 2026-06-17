const API_URL = "http://localhost:3001/pedido";

const getAuthHeaders = (token?: string) => {
  const activeToken = token || localStorage.getItem('token');
  const headers: any = {
    "Content-Type": "application/json",
  };
  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }
  return headers;
};

export const obtenerPedidos = async (token?: string) => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  return await response.json();
};

export const obtenerPedidoPorId = async (id: number, token?: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  return await response.json();
};

export const crearPedido = async (pedido: any, token?: string) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(pedido),
  });

  return await response.json();
};

export const actualizarPedido = async (
  id: number,
  pedido: any,
  token?: string
) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(pedido),
  });

  return await response.json();
};

export const eliminarPedido = async (id: number, token?: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  return await response.json();
};

export const obtenerProductosMasVendidos = async (token?: string) => {
  const response = await fetch(`${API_URL}/mas-vendidos`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return await response.json();
};
