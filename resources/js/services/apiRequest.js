import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

/**
 * Generic API request handler
 * @param {Object} options
 * @param {String} options.method - GET | POST | PUT | DELETE | PATCH
 * @param {String} options.url
 * @param {Object} [options.data]
 * @param {Object} [options.params]
 */
export async function apiRequest({
  method = "GET",
  url,
  data = null,
  params = null,
}) {
  try {
    const token = localStorage.getItem("token");

    const response = await api({
      method,
      url,
      data,
      params,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });

    return response.data;

  } catch (error) {

    // Global error handling
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    throw error.response?.data || error;
  }
}