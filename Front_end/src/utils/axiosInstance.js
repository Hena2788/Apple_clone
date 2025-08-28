import axios from "axios";
let url = import.meta.env.VITE_BASE_URL;
export const axiosInstance = axios.create({
  baseURL: url,
});
