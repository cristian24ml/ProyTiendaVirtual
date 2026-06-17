const API_URL = "http://localhost:3001/categoria";

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

export const obtenerCategorias = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener categorías");
  }

  return await response.json();
};

export const crearCategoria = async (categoria: { nombre: string }) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoria),
  });

  if (!response.ok) {
    throw new Error("Error al registrar categoría");
  }

  return await response.json();
};

export const actualizarCategoria = async (id: number, categoria: any) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoria),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar categoría");
  }

  return await response.json();
};

export const eliminarCategoria = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    throw new Error("Error al eliminar categoría");
  }

  return await response.json();
};