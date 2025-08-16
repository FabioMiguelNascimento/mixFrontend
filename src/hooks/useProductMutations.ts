import { useCallback } from "react";
import { CreateProductPayload, UpdateProductPayload } from "../schema/product.schema";
import { Product } from "../types/product.types";
import { useApi } from "./useApi";
import { ApiResponse } from "../types/api.types";

export const useProductMutations = () => {
  const { request, loading, error } = useApi<ApiResponse<Product>>();

  const createProduct = useCallback(async (productData: CreateProductPayload) => {
    return await request({
      url: '/product',
      method: 'POST',
      data: productData,
    });
  }, [request]);

  const updateProduct = useCallback(async (productData: UpdateProductPayload) => {
    return await request({
      url: `/product/${productData.id}`,
      method: 'PATCH',
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