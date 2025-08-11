import { z } from 'zod';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export const productSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  sku: z.string(),
  price: z.number(),
  discount: z.number(),
  finalPrice: z.number(),
  stock: z.number(),
  type: z.string(),
  status: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const orderItemSchema = z.object({
  orderId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int().positive(),
  price: z.number(),
  product: productSchema,
});

export const orderSchema = z.object({
  id: z.uuid(),
  customerName: z.string(),
  customerContact: z.string(),
  customerNotes: z.string().nullable(),
  totalAmount: z.number(),
  status: OrderStatus,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  userId: z.uuid().nullable(),
  orderItems: z.array(orderItemSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

