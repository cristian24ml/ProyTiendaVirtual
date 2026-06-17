const API_URL = "http://localhost:3001/producto";

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token');
  const headers: any = {
    "Content-Type": "application/json",
    ...extraHeaders
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const obtenerProductos = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener productos");
  }

  return await response.json();
};

export const crearProducto = async (producto: any) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(producto),
  });

  if (!response.ok) {
    throw new Error("Error al registrar producto");
  }

  return await response.json();
};

export const eliminarProducto = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    throw new Error("Error al eliminar producto");
  }

  return await response.json();
};

export const subirImagen = async (file: File) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const headers: any = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers,
    body: formData
  });

  if (!response.ok) {
    throw new Error("Error al subir la imagen");
  }

  return await response.json();
};

export const actualizarProducto = async (id: number, producto: any) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(producto),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar producto");
  }

  return await response.json();
};