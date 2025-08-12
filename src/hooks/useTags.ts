import { useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import type { Tag } from '../schema/tag.schema';

interface UseTagsParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  globalFilter?: string;
}

interface TagsApiResponse {
  code: number;
  message: string;
  data: {
    tags: Tag[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useTags = ({ page, limit, sortBy, sortOrder, globalFilter }: UseTagsParams) => {
  const { data, error, loading, request } = useApi<TagsApiResponse>();

  const fetchTags = useCallback(async () => {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
      ...(globalFilter && { search: globalFilter }),
    };
    await request({ url: '/tag/list', method: 'POST', data: params });
  }, [page, limit, sortBy, sortOrder, globalFilter, request]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags: data?.data.tags || [],
    totalTags: data?.data.total || 0,
    totalPages: data?.data.totalPages || 0,
    loading,
    error,
    refetch: fetchTags,
  };
};
