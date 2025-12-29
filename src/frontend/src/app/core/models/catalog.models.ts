import { PaginatedResult } from './core.models';

// --- ENUMS (Giữ nguyên từ C#) ---
export enum ProductStatus {
  Draft = 0,
  Active = 1,
  OutOfStock = 2,
  Discontinued = 3
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  status: ProductStatus;
  quantity: number;
  categoryId: string;
}

export interface CategoryListResponse extends PaginatedResult<Category> {}
export interface ProductListResponse extends PaginatedResult<Product> {}


export interface CreateCategoryRequest {
  name: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryId: string;
}

export interface StockRequest {
  quantity: number;
}