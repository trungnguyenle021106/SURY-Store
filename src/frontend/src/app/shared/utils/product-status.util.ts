import { ProductStatus } from "../../core/models/catalog.models";

export const ProductStatusLabel: Record<number, string> = {
  [ProductStatus.Draft]: 'Nháp',
  [ProductStatus.Active]: 'Đang bán',
  [ProductStatus.OutOfStock]: 'Hết hàng',
  [ProductStatus.Discontinued]: 'Ngừng bán'
};

// Map sang severity của PrimeNG Tag (success, info, warning, danger, secondary, contrast)
export const ProductStatusSeverity: Record<number, 'secondary' | 'success' | 'warning' | 'danger'> = {
  [ProductStatus.Draft]: 'secondary', // Màu xám
  [ProductStatus.Active]: 'success',  // Màu xanh lá
  [ProductStatus.OutOfStock]: 'warning', // Màu vàng
  [ProductStatus.Discontinued]: 'danger' // Màu đỏ
};