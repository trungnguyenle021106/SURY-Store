import { PaginatedResult } from './core.models';

// --- ENUMS ---
// Mapping trạng thái dựa trên luồng xử lý: 
// Submitted (New) -> Processing -> Shipped -> Completed (hoặc Cancelled)
export enum OrderStatus {
  Submitted = 0,      // Mới đặt
  AwaitingValidation = 1, // Chờ xác nhận (nếu có)
  StockConfirmed = 2, // Đã có hàng
  Paid = 3,           // Đã thanh toán
  Shipped = 4,        // Đang giao
  Cancelled = 5,      // Đã hủy
  Completed = 6       // Hoàn thành
}

// --- SHARED ENTITIES ---

export interface OrderItem {
  productId: string;
  productName: string;
  pictureUrl: string;
  unitPrice: number;
  units: number; // Số lượng
}

export interface OrderAddress {
  street: string;
  city: string;
  state?: string;
  country?: string;
  zipCode?: string;
  receiverName?: string; // Tên người nhận
  phoneNumber?: string;  // SĐT người nhận
}

// --- DTOs ---

// Dùng cho danh sách (Order Summary)
export interface OrderSummary {
  id: string;
  orderNumber: string; // Mã đơn hàng (VD: #ORD-2024-001)
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;   // Datetime string
}

// Dùng cho chi tiết (Order Detail)
export interface OrderDetail extends OrderSummary {
  description?: string;
  address: OrderAddress;
  orderItems: OrderItem[];
}

// --- RESPONSES ---

// GET /orders/user/{userId}
export interface UserOrdersResponse {
  orders: OrderSummary[];
}

// GET /admin/orders (Phân trang)
export interface AdminOrderListResponse extends PaginatedResult<OrderSummary> {}