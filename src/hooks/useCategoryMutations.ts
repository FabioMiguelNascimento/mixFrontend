import { useApi } from './useApi';
import type { Category } from '../schema/category.schema';

export const useCategoryMutations = () => {
  const { request } = useApi();

  const createCategory = async (name: string) => {
    return request({ url: '/category', method: 'POST', data: { name } });
  };

  const updateCategory = async (id: string, name: string) => {
    return request({ url: `/category/${id}`, method: 'PATCH', data: { name } });
  };

  const deleteCategory = async (id: string) => {
    return request({ url: `/category/${id}`, method: 'DELETE' });
  };

  return { createCategory, updateCategory, deleteCategory };
};