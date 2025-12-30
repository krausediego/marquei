import axios from "axios";
import { keycloak } from "../auth/keycloak";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor: antes de cada request, garante token válido e injeta Bearer
api.interceptors.request.use(async (config) => {
  if (!keycloak.authenticated) return config;

  // renova se faltar < 30s para expirar
  await keycloak.updateToken(30);

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${keycloak.token}`;

  return config;
});
