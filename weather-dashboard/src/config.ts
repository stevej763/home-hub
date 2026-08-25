export const API_SCHEME = import.meta.env.VITE_API_SCHEME || "http";
export const API_SERVER = import.meta.env.VITE_API_SERVER;
export const API_PORT = import.meta.env.VITE_API_PORT;
export const API_BASE_URL = API_PORT
  ? `${API_SCHEME}://${API_SERVER}:${API_PORT}`
  : `${API_SCHEME}://${API_SERVER}`;
