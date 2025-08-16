
import axios from 'axios';
import type { UserData } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      try {
        const userData: UserData = JSON.parse(storedUserData);
        if (userData.accessToken) {
          config.headers.Authorization = `Bearer ${userData.accessToken}`;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData: UserData = JSON.parse(storedUserData);
          const response = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken: userData.refreshToken });
          const { accessToken } = response.data.data;
          const newUserData = { ...userData, accessToken };
          localStorage.setItem('userData', JSON.stringify(newUserData));
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('userData');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
