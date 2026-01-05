import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';

// PrimeNG
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models & Utils
import { OrderService } from '../../../core/services/order.service';
import { UserService } from '../../../core/services/user.service';
import { OrderStatusLabel, OrderStatusSeverity } from '../../../shared/utils/order-status.util';
// Lưu ý: Import interface Order từ model của bạn. Tôi giả định cấu trúc dựa trên code bạn đưa.
// Nếu model UserOrdersResponse trả về { orders: Order[] } hay array trực tiếp thì chỉnh lại nhé.
// Ở đây tôi giả định UserOrdersResponse trả về 1 mảng các Order Summary.

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, TooltipModule],
  templateUrl: './order-history.component.html',
})
export class OrderHistoryComponent implements OnInit {
  orderService = inject(OrderService);
  userService = inject(UserService);

  orders: any[] = [];
  isLoading = true;

  // Import Utils để dùng trong HTML
  getStatusLabel = (status: number) => OrderStatusLabel[status] || 'Không xác định';
  getStatusSeverity = (status: number) => OrderStatusSeverity[status] || 'secondary';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    
    // Flow: Lấy User ID trước -> Lấy Order sau
    this.userService.getMe().pipe(
      switchMap(user => this.orderService.getMyOrders(user.id))
    ).subscribe({
      next: (response) => {
        // Giả sử response trả về mảng trực tiếp hoặc { data: ... }
        // Bạn cần check lại model UserOrdersResponse xem nó chứa gì.
        // Ở đây tôi ép kiểu tạm là any để chạy, bạn thay bằng field thực tế.
        this.orders = (response as any).orders || []; 
        
        // MOCK DATA NẾU API RỖNG (Để bạn test giao diện)
        if (this.orders.length === 0) {
           this.mockDataForTest();
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải đơn hàng', err);
        this.isLoading = false;
        // Mock data khi lỗi (dev mode)
        this.mockDataForTest();
      }
    });
  }

  mockDataForTest() {
    this.orders = [
      { 
        id: 'ORD-12345678', 
        createdDate: new Date(), 
        firstProductName: 'Áo Thun Basic Cotton', 
        itemsCount: 2, 
        totalPrice: 250000, 
        status: 1 // Submitted
      },
      { 
        id: 'ORD-87654321', 
        createdDate: new Date(Date.now() - 86400000), 
        firstProductName: 'Váy Jean Dáng Dài', 
        itemsCount: 1, 
        totalPrice: 320000, 
        status: 4 // Shipped
      },
      { 
        id: 'ORD-99999999', 
        createdDate: new Date(Date.now() - 100000000), 
        firstProductName: 'Quần Baggy Vải', 
        itemsCount: 3, 
        totalPrice: 550000, 
        status: 6 // Completed
      }
    ];
  }
}