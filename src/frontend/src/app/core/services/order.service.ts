import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminOrderListResponse, OrderDetail, OrderStatus, UserOrdersResponse } from '../models/ordering.models';
import { SuccessResponse } from '../models/core.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  // Base URL chung (Lưu ý: Admin API có thể nằm ở path khác, tôi sẽ xử lý bên dưới)
  private baseUrl = `${environment.apiUrl}/orders`;
  private adminUrl = `${environment.apiUrl}/admin/orders`;

  // ==========================================
  // 1. CHO KHÁCH HÀNG (CUSTOMER)
  // ==========================================

  // GET /orders/user/{userId}
  getMyOrders(userId: string): Observable<UserOrdersResponse> {
    return this.http.get<UserOrdersResponse>(`${this.baseUrl}/user/${userId}`);
  }

  // GET /orders/{id}
  getOrderById(id: string): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.baseUrl}/${id}`);
  }

  // ==========================================
  // 2. CHO QUẢN TRỊ (ADMIN)
  // ==========================================

  // GET /admin/orders?pageNumber=...&status=...&searchTerm=...
  getOrdersForAdmin(
    pageNumber: number = 1, 
    pageSize: number = 10, 
    status?: OrderStatus, 
    searchTerm?: string
  ): Observable<AdminOrderListResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (status !== undefined && status !== null) {
      params = params.set('status', status.toString());
    }

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<AdminOrderListResponse>(this.adminUrl, { params });
  }

  // --- QUẢN LÝ TRẠNG THÁI (State Transitions) ---
  // Giả định route là: PATCH /admin/orders/{id}/ship ... (hoặc /orders/{id}/ship)
  // Dựa vào context, thường các lệnh này nằm ở controller xử lý đơn hàng.
  
  // PATCH /orders/{id}/start-processing (hoặc tương tự)
  startProcessing(id: string): Observable<SuccessResponse> {
    return this.http.patch<SuccessResponse>(`${this.baseUrl}/${id}/start-processing`, {});
  }

  // PATCH /orders/{id}/ship
  shipOrder(id: string): Observable<SuccessResponse> {
    return this.http.patch<SuccessResponse>(`${this.baseUrl}/${id}/ship`, {});
  }

  // PATCH /orders/{id}/complete
  completeOrder(id: string): Observable<SuccessResponse> {
    return this.http.patch<SuccessResponse>(`${this.baseUrl}/${id}/complete`, {});
  }

  // PATCH /orders/{id}/cancel
  cancelOrder(id: string): Observable<SuccessResponse> {
    return this.http.patch<SuccessResponse>(`${this.baseUrl}/${id}/cancel`, {});
  }
}