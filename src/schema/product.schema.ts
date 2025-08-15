import { z } from 'zod';

export const productTypeEnum = z.enum(['SINGLE', 'BASKET']);
export const productStatusEnum = z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']);

const baseProductFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number({ message: "Preço é obrigatório." }).min(0, "Preço deve ser um número positivo."),
  discount: z.number().min(0, "Desconto deve ser um número positivo.").optional(),
  stock: z.number({ message: "Estoque é obrigatório." }).int("Estoque deve ser um número inteiro.").min(0, "Estoque não pode ser negativo."),
  categoryIds: z.array(z.string().uuid()).min(1, "É necessário no mínimo uma categoria."),
  tagIds: z.array(z.string().uuid()).optional(),
  status: productStatusEnum,
});

export const singleProductFormSchema = baseProductFormSchema.extend({
  type: z.literal('SINGLE'),
});

export const basketProductFormSchema = baseProductFormSchema.extend({
  type: z.literal('BASKET'),
  basketItems: z.array(
    z.object({
      productId: z.string().uuid("ID de produto inválido"),
      quantity: z.number().int().min(1, "Quantidade deve ser no mínimo 1"),
    })
  ).min(1, "Cestas devem conter itens e produtos únicos não devem."),
});

const productFormSchemaWithValidation = z.discriminatedUnion('type', [
  singleProductFormSchema,
  basketProductFormSchema,
]);

export const productFormSchema = productFormSchemaWithValidation;

export type SingleProductFormValues = z.infer<typeof singleProductFormSchema>;
export type BasketProductFormValues = z.infer<typeof basketProductFormSchema>;
export type ProductFormValues = z.infer<typeof productFormSchema>;

export const imageInputSchema = z.object({
  key: z.string(),
});

export const createProductPayloadSchema = z
  .object({
    name: z.string().min(1, 'Nome é necessário'),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().min(0, 'Preço deve ser um número positivo'),
    discount: z.number().min(0, 'Desconto deve ser um número positivo.').optional(),
    finalPrice: z.number().min(0, 'Preço final deve ser um número positivo'),
    stock: z.number().int().min(0, 'Estoque deve ser um inteiro não negativo'),
    type: productTypeEnum,
    status: productStatusEnum.default('DRAFT'),
    categoryIds: z.array(z.uuid('ID de categoria inválido.')).min(1, 'É necessário no mínimo uma categoria'),
    tagIds: z.array(z.uuid('ID de tag inválido.')).optional(),
    images: z.array(imageInputSchema).optional(),
    basketItems: z.array(z.object({
      productId: z.uuid('ID de produto inválido.'),
      quantity: z.number().int().min(1, 'Quantidade deve ser no mínimo 1'),
    })).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'BASKET') {
        return data.basketItems && data.basketItems.length > 0;
      }
      if (data.type === 'SINGLE') {
        return !data.basketItems || data.basketItems.length === 0;
      }
      return true;
    },
    {
      message: 'Cestas devem conter itens e produtos únicos não devem.',
      path: ['basketItems'],
    }
  )
  .refine((data) => data.finalPrice <= data.price, {
    message: 'O preço final não pode ser maior que o preço original.',
    path: ['finalPrice'],
  });

export const updateProductPayloadSchema = z
  .object({
    id: z.uuid('ID de produto inválido'),
    name: z.string().min(1, 'Nome é necessário').optional(),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().min(0, 'Preço deve ser um número positivo').optional(),
    discount: z.number().min(0, 'Desconto deve ser um número positivo.').optional(),
    finalPrice: z.number().min(0, 'Preço final deve ser um número positivo').optional(),
    stock: z.number().int().min(0, 'Estoque deve ser um inteiro não negativo').optional(),
    type: productTypeEnum.optional(),
    status: productStatusEnum.optional(),
    categoryIds: z.array(z.uuid('ID de categoria inválido.')).min(1, 'É necessário no mínimo uma categoria').optional(),
    tagIds: z.array(z.uuid('ID de tag inválido.')).optional(),
    images: z.array(imageInputSchema).optional(),
    basketItems: z.array(z.object({
      productId: z.uuid('ID de produto inválido.'),
      quantity: z.number().int().min(1, 'Quantidade deve ser no mínimo 1'),
    })).optional(),
  })
  .refine((data) => {
    if (data.type === 'BASKET' && (!data.basketItems || data.basketItems.length === 0)) {
      return false;
    }
    if (data.type === 'SINGLE' && data.basketItems && data.basketItems.length > 0) {
      return false;
    }
    return true;
  }, {
    message: 'Cestas devem conter itens e produtos únicos não devem.',
    path: ['basketItems'],
  })
  .refine((data) => {
    if (data.finalPrice !== undefined && data.price !== undefined) {
      return data.finalPrice <= data.price;
    }
    return true;
  }, {
    message: 'O preço final não pode ser maior que o preço original.',
    path: ['finalPrice'],
  });

export type CreateProductPayload = z.infer<typeof createProductPayloadSchema>;
export type UpdateProductPayload = z.infer<typeof updateProductPayloadSchema>;
