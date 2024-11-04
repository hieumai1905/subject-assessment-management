import axios from "axios";

const authApi = axios.create({
    baseURL: "http://localhost:8080",
  // baseURL: "http://chunchun.io.vn:9000",
  // baseURL: process.env.REACT_APP_BASE_URL,
});

authApi.defaults.headers.common["Content-Type"] = "application/json";

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authApi;
