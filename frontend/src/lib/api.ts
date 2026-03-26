


import axios from "axios";

export const api = axios.create({
  baseURL: window.location.origin + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});








// import axios from "axios";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL ||
//   "https://market-hub-app-production-7142.up.railway.app/api";

// export const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });




// import axios from "axios";

// export const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api",

// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });



