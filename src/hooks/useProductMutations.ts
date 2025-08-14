import { useCallback } from 'react';
import { useApi } from './useApi';
import type { Product } from '../schema/product.schema';

export const useProductMutations = () => {
  const { request, loading, error } = useApi<Product>();

  const createProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    return await request({
      url: '/product',
      method: 'POST',
      data: productData,
    });
  }, [request]);

  const updateProduct = useCallback(async (productData: Product) => {
    return await request({
      url: `/product/${productData.id}`,
      method: 'PUT',
      data: productData,
    });
  }, [request]);

  const deleteProduct = useCallback(async (productId: string) => {
    return await request({
      url: `/product/${productId}`,
      method: 'DELETE',
    });
  }, [request]);

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading: loading,
    error,
  };
};