import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AdminOrderListResponse, 
  OrderDetail, 
  OrderStatus, 
  UserOrdersResponse,
  OrderSummary 
} from '../models/ordering.models';
import { PaginatedResult, SuccessResponse } from '../models/core.models'; // Đảm bảo import PaginatedResult
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  // Base URL: .../api/orders
  private baseUrl = `${environment.apiUrl}/orders`;
  private adminUrl = `${environment.apiUrl}/admin/orders`;

  // ==========================================
  // 1. CHO KHÁCH HÀNG (CUSTOMER)
  // ==========================================

  // [CŨ] GET /orders/user/{userId} - Lấy tất cả (không phân trang)
  getOrderByUserId(userId: string): Observable<UserOrdersResponse> {
    return this.http.get<UserOrdersResponse>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * [MỚI] GET /orders/me
   * Lấy danh sách đơn hàng của người dùng đang đăng nhập (Dựa trên Token)
   * Hỗ trợ: Phân trang, Lọc trạng thái, Tìm kiếm
   */
  getOrdersByCurrentUser(
    pageNumber: number = 1,
    pageSize: number = 10,
    status?: OrderStatus,
    searchTerm?: string
  ): Observable<PaginatedResult<OrderSummary>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (status !== undefined && status !== null) {
      params = params.set('status', status.toString());
    }

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    // Backend trả về kết quả phân trang (PaginatedResult)
    return this.http.get<PaginatedResult<OrderSummary>>(`${this.baseUrl}/me`, { params });
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
  
  // PATCH /orders/{id}/start-processing
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