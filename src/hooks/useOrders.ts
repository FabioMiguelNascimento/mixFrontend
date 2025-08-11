import { useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import type { Order, OrderItem } from '../schema/order.schema';

interface UseOrdersParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  globalFilter?: string;
}

interface OrdersApiResponse {
  code: number;
  message: string;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useOrders = ({ page, limit, sortBy, sortOrder, globalFilter }: UseOrdersParams) => {
  const { data, error, loading, request } = useApi<OrdersApiResponse>();

  const fetchOrders = useCallback(async () => {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
      ...(globalFilter && { search: globalFilter }),
    };
    await request({ url: '/order/list', method: 'POST', data: params });
  }, [page, limit, sortBy, sortOrder, globalFilter, request]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders: data?.data.orders || [],
    totalOrders: data?.data.total || 0,
    totalPages: data?.data.totalPages || 0,
    loading,
    error,
    refetch: fetchOrders,
  };
};
