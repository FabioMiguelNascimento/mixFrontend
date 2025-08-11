import { useState } from 'react';
import api from '../services/api';
import { OrderStatus } from '../schema/order.schema';

interface UpdateOrderStatusResponse {
  message: string;
  orderId: string;
  newStatus: OrderStatus;
}

interface UseUpdateOrderStatusResult {
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<UpdateOrderStatusResponse | undefined>;
  loading: boolean;
  error: Error | null;
}

export const useUpdateOrderStatus = (): UseUpdateOrderStatusResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = async (orderId: string, newStatus: OrderStatus): Promise<UpdateOrderStatusResponse | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch<UpdateOrderStatusResponse>(`/order/status/${orderId}`, {
        status: newStatus,
      });
      return response.data;
    } catch (err) {
      setError(err as Error);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStatus,
    loading,
    error,
  };
};
