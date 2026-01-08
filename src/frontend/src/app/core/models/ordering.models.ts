import { PaginatedResult } from './core.models';

// --- ENUMS ---
// Mapping trạng thái dựa trên luồng xử lý: 
// Submitted (New) -> Processing -> Shipped -> Completed (hoặc Cancelled)
export enum OrderStatus {
  Pending = 1,    // Chờ xác nhận
  Processing = 2, // Đang xử lý
  Shipping = 3,   // Đang giao hàng
  Completed = 4,  // Hoàn thành
  Cancelled = 5,  // Đã hủy
  OutOfStock = 6  // Hết hàng
}

// --- SHARED ENTITIES ---

export interface OrderItem {
  productId: string;
  productName: string;
  pictureUrl: string;
  unitPrice: number;
  quantity: number; // Số lượng
}

export interface OrderAddress {
  street: string;
  fullAddress: string;
  receiverName?: string; // Tên người nhận
  phoneNumber?: string;  // SĐT người nhận
}

// --- DTOs ---

// Dùng cho danh sách (Order Summary)
export interface OrderSummary {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  orderDate: string;   // Datetime string
}

// Dùng cho chi tiết (Order Detail)
export interface OrderDetail extends OrderSummary {
  description?: string;
  shippingAddress: OrderAddress;
  orderItems: OrderItem[];
}

// --- RESPONSES ---

// GET /orders/user/{userId}
export interface UserOrdersResponse {
  orders: OrderSummary[];
}

// GET /admin/orders (Phân trang)
export interface AdminOrderListResponse extends PaginatedResult<OrderSummary> {}