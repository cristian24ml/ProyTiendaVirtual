const API_URL = "http://localhost:3001/auth";
const LOGS_URL = "http://localhost:3001/log-acceso";

export const obtenerCaptcha = async () => {
  const response = await fetch(`${API_URL}/captcha`);
  if (!response.ok) {
    throw new Error("Error al obtener captcha");
  }
  return await response.json();
};

export const login = async (credentials: any) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al iniciar sesión");
  }

  return await response.json();
};

export const registrarUsuario = async (userData: any) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al registrar usuario");
  }

  return await response.json();
};

export const logout = async (token: string) => {
  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al cerrar sesión");
  }

  return await response.json();
};

export const obtenerLogs = async (token: string) => {
  const response = await fetch(LOGS_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener logs de acceso");
  }

  return await response.json();
};

export const obtenerUsuarios = async (token: string) => {
  const response = await fetch("http://localhost:3001/usuario", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener usuarios");
  }

  return await response.json();
};

export const eliminarUsuario = async (id: number, token: string) => {
  const response = await fetch(`http://localhost:3001/usuario/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al eliminar usuario");
  }

  return await response.json();
};

export const actualizarUsuario = async (id: number, userData: any, token: string) => {
  const response = await fetch(`http://localhost:3001/usuario/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al modificar usuario");
  }

  return await response.json();
};
