import { useApi } from './useApi';
import type { Tag } from '../schema/tag.schema';

export const useTagMutations = () => {
  const { request } = useApi();

  const createTag = async (name: string) => {
    return request({ url: '/tag', method: 'POST', data: { name } });
  };

  const updateTag = async (id: string, name: string) => {
    return request({ url: `/tag/${id}`, method: 'PATCH', data: { name } });
  };

  const deleteTag = async (id: string) => {
    return request({ url: `/tag/${id}`, method: 'DELETE' });
  };

  return { createTag, updateTag, deleteTag };
};