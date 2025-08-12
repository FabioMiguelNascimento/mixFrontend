import z from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'O nome da categoria deve ter pelo menos 2 caracteres.').max(50, 'O nome da categoria não pode ter mais de 50 caracteres.'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(2, 'O nome da categoria deve ter pelo menos 2 caracteres.').max(50, 'O nome da categoria não pode ter mais de 50 caracteres.'),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const categoryIdSchema = z.object({
  id: z.string().uuid('ID inválido. Deve ser um UUID válido.'),
});

export type CategoryId = z.infer<typeof categoryIdSchema>;

export const listCategorySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  name: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListCategoryInput = z.infer<typeof listCategorySchema>;

export const CategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Category = z.infer<typeof CategorySchema>;