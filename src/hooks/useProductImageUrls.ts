import { useCallback, useState } from 'react';
import { useApi } from './useApi';

interface UseProductImageUrlsResult {
  fetchImageUrls: (keys: string[]) => Promise<Record<string, string | null> | undefined>;
  loading: boolean;
  error: Error | null;
}

export const useProductImageUrls = (): UseProductImageUrlsResult => {
  const { data, error, loading, request } = useApi<Record<string, string | null>>();

  const fetchImageUrls = useCallback(async (keys: string[]) => {
    if (keys.length === 0) {
      return {};
    }

    const response = await request({
      url: '/product/images/urls',
      method: 'POST',
      data: { keys },
    });

    return response?.data;
  }, [request]);

  return {
    fetchImageUrls,
    loading,
    error,
  };
};