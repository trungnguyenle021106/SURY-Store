import { OrderStatus } from "../../core/models/ordering.models";

export const OrderStatusLabel: Record<number, string> = {
  [OrderStatus.Submitted]: 'Đã đặt hàng',
  [OrderStatus.AwaitingValidation]: 'Chờ xác nhận',
  [OrderStatus.StockConfirmed]: 'Đã có hàng',
  [OrderStatus.Paid]: 'Đã thanh toán',
  [OrderStatus.Shipped]: 'Đang giao hàng',
  [OrderStatus.Cancelled]: 'Đã hủy',
  [OrderStatus.Completed]: 'Hoàn thành'
};

// Map màu cho PrimeNG Tag
export const OrderStatusSeverity: Record<number, 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'contrast'> = {
  [OrderStatus.Submitted]: 'info',        // Xanh dương nhạt
  [OrderStatus.AwaitingValidation]: 'warning', // Vàng (Cần admin check)
  [OrderStatus.StockConfirmed]: 'info',
  [OrderStatus.Paid]: 'success',
  [OrderStatus.Shipped]: 'secondary',     // Màu xám/tím (đang đi đường)
  [OrderStatus.Cancelled]: 'danger',      // Đỏ
  [OrderStatus.Completed]: 'success'      // Xanh lá đậm
};