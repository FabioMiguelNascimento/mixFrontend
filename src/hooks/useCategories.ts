import { useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import type { Category, ListCategoryInput } from '../schema/category.schema';

interface UseCategoriesParams extends ListCategoryInput {}

interface CategoriesApiResponse {
  code: number;
  message: string;
  data: {
    categories: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useCategories = ({ page, limit, sortBy, sortOrder, name }: UseCategoriesParams) => {
  const { data, error, loading, request } = useApi<CategoriesApiResponse>();

  const fetchCategories = useCallback(async () => {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
      ...(name && { name }),
    };
    await request({ url: '/category/list', method: 'POST', data: params });
  }, [page, limit, sortBy, sortOrder, name, request]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories: data?.data.categories || [],
    totalCategories: data?.data.total || 0,
    totalPages: data?.data.totalPages || 0,
    loading,
    error,
    refetch: fetchCategories,
  };
};