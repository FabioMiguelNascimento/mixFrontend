
import { useState } from 'react';
import api from '../services/api';
import type { AxiosError, AxiosRequestConfig } from 'axios';

interface UseApiReturn<T> {
  data: T | null;
  error: AxiosError | null;
  loading: boolean;
  request: (config: AxiosRequestConfig) => Promise<T | null>;
}

export const useApi = <T = any>(): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const request = async (config: AxiosRequestConfig): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.request<T>(config);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      setError(err);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, request };
};
