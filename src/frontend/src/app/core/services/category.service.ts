import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, CategoryListResponse, CreateCategoryRequest } from '../models/catalog.models';
import { IdResponse, SuccessResponse } from '../models/core.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/categories`;

  getCategories(pageNumber: number = 1, pageSize: number = 10, keyword?: string): Observable<CategoryListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<CategoryListResponse>(this.baseUrl, { params });
  }

  createCategory(payload: CreateCategoryRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.baseUrl, payload);
  }


  getCategoryById(id: string) { return this.http.get<Category>(`${this.baseUrl}/${id}`); }
  updateCategory(id: string, payload: { name: string }) { return this.http.put<SuccessResponse>(`${this.baseUrl}/${id}`, payload); }
}