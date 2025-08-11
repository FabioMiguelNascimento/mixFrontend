
import axios from 'axios';
import type { UserData } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use(
  (config) => {
    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      try {
        const userData: UserData = JSON.parse(storedUserData);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
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

export default api;
