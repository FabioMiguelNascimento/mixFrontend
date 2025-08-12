
import { useState } from 'react';
import api from '../services/api';
import { ProductStatus } from '../schema/product.schema';

interface UpdateProductStatusResponse {
  message: string;
  productId: string;
  newStatus: ProductStatus;
}

interface UseUpdateProductStatusResult {
  updateStatus: (productId: string, newStatus: ProductStatus) => Promise<UpdateProductStatusResponse | undefined>;
  loading: boolean;
  error: Error | null;
}

export const useUpdateProductStatus = (): UseUpdateProductStatusResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = async (productId: string, newStatus: ProductStatus): Promise<UpdateProductStatusResponse | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch<UpdateProductStatusResponse>(`/product/status/${productId}`, {
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
