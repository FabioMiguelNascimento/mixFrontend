import { z } from 'zod';
import { CategorySchema } from './category.schema';
import { tagSchema } from './tag.schema';

export const productTypeEnum = z.enum(['SINGLE', 'BASKET']);
export const productStatusEnum = z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']);

// A simpler product schema for nested products in baskets to avoid circular dependencies
const simpleProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sku: z.string().nullable(),
  finalPrice: z.number(),
});

export const basketItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  product: simpleProductSchema,
});

export const imageSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  url: z.url().optional(),
});

// Base schema without transformation, can be used for validation and picking fields
export const baseProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  sku: z.string().nullable(),
  price: z.number(),
  discount: z.number(),
  finalPrice: z.number(),
  stock: z.number().int(),
  type: productTypeEnum,
  status: productStatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  images: z.array(imageSchema),
  basketItems: z.array(basketItemSchema).optional(),

  productCategories: z.array(z.object({ category: CategorySchema })),
  productTags: z.array(z.object({ tag: tagSchema })),
});


export const productSchema = baseProductSchema.transform((data) => ({
  ...data,
  categories: data.productCategories.map((pc) => pc.category),
  tags: data.productTags.map((pt) => pt.tag),
}));

export type Product = z.infer<typeof productSchema>;
export type ProductType = z.infer<typeof productTypeEnum>;
export type ProductStatus = z.infer<typeof productStatusEnum>;
export type BasketItem = z.infer<typeof basketItemSchema>;
export type ProductImage = z.infer<typeof imageSchema>;

export const productsApiResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    products: z.array(productSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type ProductsApiResponse = z.infer<typeof productsApiResponseSchema>;