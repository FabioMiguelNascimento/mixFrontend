import { z } from 'zod';

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome da tag é obrigatório'),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Tag = z.infer<typeof tagSchema>;

export const listTagSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  globalFilter: z.string().optional(),
});
