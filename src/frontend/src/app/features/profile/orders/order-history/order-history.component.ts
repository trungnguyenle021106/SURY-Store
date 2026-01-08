import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

// PrimeNG
import { TableLazyLoadEvent, TableModule } from 'primeng/table'; // Thêm TableLazyLoadEvent
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator'; // Thêm Paginator

// Services & Models
import { OrderService } from '../../../../core/services/order.service';
import { OrderSummary } from '../../../../core/models/ordering.models'; // Import model chuẩn
import { OrderStatusLabel, OrderStatusSeverity } from '../../../../shared/utils/order-status.util';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    TagModule, 
    ButtonModule, 
    TooltipModule,
    RouterLink,
    PaginatorModule
  ],
  templateUrl: './order-history.component.html',
})
export class OrderHistoryComponent implements OnInit {
  orderService = inject(OrderService);

  // Data
  orders: any[] = []; // Dữ liệu hiển thị
  isLoading = true;

  // Pagination Config
  totalRecords: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;

  // Utils Helpers
  getStatusLabel = (status: number) => OrderStatusLabel[status] || 'Không xác định';
  getStatusSeverity = (status: number) => OrderStatusSeverity[status] || 'secondary';

  ngOnInit() {
    // Không cần gọi loadOrders() ở đây nữa vì p-table [lazy]="true" 
    // sẽ tự động kích hoạt sự kiện (onLazyLoad) lần đầu tiên.
  }

  // Hàm gọi API (được kích hoạt bởi Table khi đổi trang hoặc init)
  loadOrders(event?: TableLazyLoadEvent) {
    this.isLoading = true;

    // Tính toán pageNumber từ event của PrimeNG (first / rows)
    if (event) {
      this.pageNumber = (event.first || 0) / (event.rows || 10) + 1;
      this.pageSize = event.rows || 10;
    }

    // Gọi API mới: getOrdersByCurrentUser
    this.orderService.getOrdersByCurrentUser(this.pageNumber, this.pageSize)
      .pipe(
        map(response => {
          // Cập nhật tổng số bản ghi cho Paginator
          this.totalRecords = response.count; // Hoặc response.totalCount tùy model PaginatedResult

          // Map dữ liệu (nếu cần xử lý thêm tên sản phẩm)
          // Nếu model OrderSummary backend trả về đã chuẩn rồi thì có thể bỏ đoạn map này
          return response.data.map((order: any) => {
             // Logic mapping tương tự cũ để đảm bảo UI không lỗi
             const items = order.orderItems || [];
             const firstItem = items.length > 0 ? items[0] : null;

             return {
               ...order,
               // Ưu tiên lấy từ field có sẵn, nếu không thì tự tính từ items
               firstProductName: order.firstProductName || (firstItem ? firstItem.productName : 'Đơn hàng'),
               itemsCount: order.itemsCount || items.length || 0
             };
          });
        })
      )
      .subscribe({
        next: (mappedOrders) => {
          this.orders = mappedOrders;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi tải đơn hàng', err);
          this.isLoading = false;
        }
      });
  }

  viewDetail(orderId: string) {
     // this.router.navigate(['/profile/orders', orderId]);
  }
}