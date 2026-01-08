import { OrderStatus } from "../../core/models/ordering.models";

// Label hiển thị tiếng Việt (Khớp với Description trong C#)
export const OrderStatusLabel: Record<number, string> = {
  [OrderStatus.Pending]: 'Chờ xác nhận',
  [OrderStatus.Processing]: 'Đang xử lý',
  [OrderStatus.Shipping]: 'Đang giao hàng',
  [OrderStatus.Completed]: 'Hoàn thành',
  [OrderStatus.Cancelled]: 'Đã hủy',
  [OrderStatus.OutOfStock]: 'Hết hàng'
};

// Map màu cho PrimeNG Tag
// Các màu: success (xanh lá), info (xanh dương), warning (vàng), danger (đỏ), secondary (xám)
export const OrderStatusSeverity: Record<number, 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'contrast'> = {
  [OrderStatus.Pending]: 'info',        // Xanh dương: Mới đặt, cần chú ý
  [OrderStatus.Processing]: 'warning',  // Vàng: Đang soạn hàng/đóng gói
  [OrderStatus.Shipping]: 'secondary',  // Xám/Tím nhạt: Đã bàn giao vận chuyển
  [OrderStatus.Completed]: 'success',   // Xanh lá: Thành công
  [OrderStatus.Cancelled]: 'danger',    // Đỏ: Thất bại
  [OrderStatus.OutOfStock]: 'danger'    // Đỏ: Lỗi hết hàng
};

export function parseOrderStatus(status: any): number {
  // 1. Nếu đã là số thì trả về luôn
  if (typeof status === 'number') {
    return status;
  }

  // 2. Nếu là chuỗi (VD: "Pending"), tìm trong Enum để lấy ra số (1)
  if (typeof status === 'string') {
    // Trong TS, OrderStatus["Pending"] sẽ trả về 1
    const enumVal = (OrderStatus as any)[status];
    if (enumVal !== undefined) {
      return enumVal;
    }
  }

  // 3. Fallback: Trả về 0 hoặc Pending mặc định nếu lỗi
  return OrderStatus.Pending; 
}