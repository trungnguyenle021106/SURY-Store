import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SuccessResponse } from '../models/core.models';
import { CreateProductRequest, Product, ProductListResponse, StockRequest } from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/products`;

    getProducts(
        pageNumber: number = 1,
        pageSize: number = 10,
        keyword?: string,
        categoryId?: string,
        excludeId?: string,
        includeDrafts: boolean = false // <--- THÊM THAM SỐ NÀY (Mặc định false)
    ): Observable<ProductListResponse> {

        let params = new HttpParams()
            .set('pageNumber', pageNumber)
            .set('pageSize', pageSize)
            .set('includeDrafts', includeDrafts); // <--- Luôn gửi lên BE

        if (keyword) {
            params = params.set('keyword', keyword);
        }
        if (categoryId) {
            params = params.set('categoryId', categoryId);
        }

        if (excludeId) {
            params = params.set('excludeId', excludeId);
        }

        return this.http.get<ProductListResponse>(this.baseUrl, { params });
    }

    createProduct(payload: CreateProductRequest): Observable<Product> {
        return this.http.post<Product>(this.baseUrl, payload);
    }

    updateStock(id: string, quantity: number): Observable<SuccessResponse> {
        const payload: StockRequest = { quantity };
        return this.http.post<SuccessResponse>(`${this.baseUrl}/${id}/stock`, payload);
    }

    getProductById(id: string) { return this.http.get<Product>(`${this.baseUrl}/${id}`); }
    updateProduct(id: string, payload: CreateProductRequest) { return this.http.put<SuccessResponse>(`${this.baseUrl}/${id}`, payload); }
    activateProduct(id: string) { return this.http.put<SuccessResponse>(`${this.baseUrl}/${id}/activate`, {}); }
    discontinueProduct(id: string) { return this.http.put<SuccessResponse>(`${this.baseUrl}/${id}/discontinue`, {}); }
    addStock(id: string, payload: StockRequest) { return this.http.post<SuccessResponse>(`${this.baseUrl}/${id}/stock`, payload); }
    removeStock(id: string, payload: StockRequest) { return this.http.post<SuccessResponse>(`${this.baseUrl}/${id}/stock/remove`, payload); }
}