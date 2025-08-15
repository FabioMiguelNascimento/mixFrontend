export type ProductType = 'SINGLE' | 'BASKET';
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface BaseProduct {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  discount: number;
  finalPrice: number;
  stock: number;
  type: ProductType;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  key: string;
  productId?: string;
  url?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BasketItem {
  basketId: string;
  productId: string;
  quantity: number;
  product: Pick<BaseProduct, 'id' | 'name' | 'sku' | 'finalPrice'>;
}

export interface Product extends BaseProduct {
  images: ProductImage[];
  categories: Category[];
  tags: Tag[];
  basketItems?: BasketItem[];
  
}

export interface BaseProductFormData {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  discount?: number;
  stock: number;
  categoryIds: string[];
  tagIds?: string[];
  status: ProductStatus;
  images?: Array<{ key: string }>;
}

export interface SingleProductFormData extends BaseProductFormData {
  type: 'SINGLE';
}

export interface BasketProductFormData extends BaseProductFormData {
  type: 'BASKET';
  basketItems: Array<{ productId: string; quantity: number }>;
}

export type ProductFormData = SingleProductFormData | BasketProductFormData;

export interface ProductsApiResponse {
  code: number;
  message: string;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}
