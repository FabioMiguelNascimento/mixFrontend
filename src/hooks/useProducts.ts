
import { useCallback, useEffect } from 'react';
import type { ProductsApiResponse, ProductType } from '../types/product.types';
import { useApi } from './useApi';

interface UseProductsParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  globalFilter?: string;
  type: ProductType;
}

export const useProducts = ({ page, limit, sortBy, sortOrder, globalFilter, type }: UseProductsParams) => {
  const { data, error, loading, request } = useApi<ProductsApiResponse>();

  const fetchProducts = useCallback(async () => {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
      type,
      ...(globalFilter && { search: globalFilter }),
    };
    await request({ url: '/product/list', method: 'POST', data: params });
  }, [page, limit, sortBy, sortOrder, globalFilter, type, request]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: data?.data.products || [],
    totalProducts: data?.data.total || 0,
    totalPages: data?.data.totalPages || 0,
    loading,
    error,
    refetch: fetchProducts,
  };
};
