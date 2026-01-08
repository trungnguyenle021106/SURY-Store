import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

// Services & Models
import { OrderService } from '../../../../core/services/order.service';
import { OrderDetail } from '../../../../core/models/ordering.models';
import { OrderStatusLabel, OrderStatusSeverity } from '../../../../shared/utils/order-status.util';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TagModule,
    TableModule,
    CardModule,
    DividerModule,
    SkeletonModule
  ],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order: OrderDetail | null = null;
  isLoading = true;
  errorMessage = '';

  // Helpers cho Template
  getStatusLabel = (status: number) => OrderStatusLabel[status] || 'Không xác định';
  getStatusSeverity = (status: number) => OrderStatusSeverity[status] || 'secondary';

  ngOnInit() {
    this.loadOrder();
  }

  loadOrder() {
    // Lấy ID từ URL (ví dụ: /profile/orders/123)
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      this.isLoading = false;
      this.errorMessage = 'Không tìm thấy mã đơn hàng hợp lệ.';
      return;
    }

    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (data: any) => {
        this.order = data.order;
        if (this.order) {
          this.order.status = data.order.statusId;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải chi tiết đơn hàng:', err);
        this.errorMessage = 'Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }
}