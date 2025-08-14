import { useCallback } from 'react';
import { ProductImage } from '../schema/product.schema';
import { useApi } from './useApi';

interface UseProductImagesResult {
  uploadImage: (productId: string, file: File) => Promise<ProductImage | undefined>;
  deleteImage: (imageId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export const useProductImages = (): UseProductImagesResult => {
  const { data, error, loading, request } = useApi<ProductImage>(); 

  const uploadImage = useCallback(async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await request({
      url: `/product/images/${productId}`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response?.data?.data ? { ...response.data.data, url: URL.createObjectURL(file) } : undefined;
  }, [request]);

  const deleteImage = useCallback(async (imageId: string) => {
    await request({
      url: `/product/images/${imageId}`,
      method: 'DELETE',
    });
  }, [request]);

  return {
    uploadImage,
    deleteImage,
    loading,
    error,
  };
};
