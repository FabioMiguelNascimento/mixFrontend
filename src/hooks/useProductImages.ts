import { useCallback } from 'react';
import { ProductImage } from '../types/product.types';
import { useApi } from './useApi';

interface UseProductImagesResult {
  uploadImages: (productId: string, files: File[]) => Promise<ProductImage[] | undefined>;
  deleteImage: (imageId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export const useProductImages = (): UseProductImagesResult => {
  const { data, error, loading, request } = useApi<ProductImage[]>(); 

  const uploadImages = useCallback(async (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await request({
      url: `/product/images/${productId}`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response?.data;
  }, [request]);

  const deleteImage = useCallback(async (imageId: string) => {
    await request({
      url: `/product/images/${imageId}`,
      method: 'DELETE',
    });
  }, [request]);

  return {
    uploadImages,
    deleteImage,
    loading,
    error,
  };
};
