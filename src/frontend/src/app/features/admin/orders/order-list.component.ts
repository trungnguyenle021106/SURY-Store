import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { OrderService } from '../../../core/services/order.service';
import { OrderDetail, OrderSummary, OrderStatus } from '../../../core/models/ordering.models';
// Nhớ import parseOrderStatus
import { OrderStatusLabel, OrderStatusSeverity, parseOrderStatus } from '../../../shared/utils/order-status.util';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, DropdownModule,
    DialogModule, TagModule, ToastModule, ConfirmDialogModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './order-list.component.html',
  styles: [`
    .item-row:last-child { border-bottom: none !important; }
  `]
})
export class OrderListComponent implements OnInit {
  orderService = inject(OrderService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  // Data List
  orders: OrderSummary[] = [];
  totalRecords = 0;
  isLoading = false;

  // Pagination & Filter
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  selectedStatus: OrderStatus | null = null;

  // Options
  statusOptions = Object.keys(OrderStatusLabel).map(key => ({
    label: OrderStatusLabel[+key],
    value: +key
  }));

  // Detail Dialog
  displayDialog = false;
  selectedOrder: OrderDetail | null = null;
  isLoadingDetail = false;

  // Utils
  OrderStatus = OrderStatus;
  
  // Dùng parseOrderStatus để hiển thị đúng Label/Màu dù BE trả về chuỗi hay số
  getStatusLabel = (s: any) => OrderStatusLabel[parseOrderStatus(s)];
  getStatusSeverity = (s: any) => OrderStatusSeverity[parseOrderStatus(s)];

  ngOnInit(): void {}

  // 1. Load danh sách
  loadOrders(event?: any) {
    this.isLoading = true;
    if (event) {
      this.currentPage = (event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }

    this.orderService.getOrdersForAdmin(
      this.currentPage,
      this.pageSize,
      this.selectedStatus ?? undefined,
      this.searchTerm
    ).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.totalRecords = res.count;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.orders = [];
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tải được danh sách đơn hàng' });
      }
    });
  }

  // 2. Xem chi tiết (ĐÃ FIX LOGIC STATUS)
  viewOrder(orderId: string) {
    this.displayDialog = true;
    this.isLoadingDetail = true;
    this.selectedOrder = null;

    this.orderService.getOrderById(orderId).subscribe({
      next: (res: any) => {
        // Lấy object data (xử lý trường hợp BE bọc trong .order hoặc trả về trực tiếp)
        const rawData = res.order || res;
        
        // --- QUAN TRỌNG: Ép kiểu status về số (Number) ngay tại đây ---
        // Để các điều kiện *ngIf trong HTML so sánh đúng với Enum
        this.selectedOrder = {
            ...rawData,
            status: parseOrderStatus(rawData.status) 
        };
        
        this.isLoadingDetail = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tải được chi tiết đơn hàng' });
        this.displayDialog = false;
        this.isLoadingDetail = false;
      }
    });
  }

  // 3. Cập nhật trạng thái
  changeStatus(action: 'process' | 'ship' | 'complete' | 'cancel') {
    if (!this.selectedOrder) return;
    const id = this.selectedOrder.id;

    let message = '';
    let header = 'Xác nhận';
    let apiCall;

    switch (action) {
      case 'process':
        message = 'Xác nhận đơn hàng và chuyển sang trạng thái Đang xử lý?';
        apiCall = this.orderService.startProcessing(id);
        break;
      case 'ship':
        message = 'Đơn hàng đã đóng gói xong và bàn giao cho Shipper?';
        apiCall = this.orderService.shipOrder(id);
        break;
      case 'complete':
        message = 'Khách đã nhận hàng và thanh toán thành công?';
        apiCall = this.orderService.completeOrder(id);
        break;
      case 'cancel':
        message = 'Bạn có chắc chắn muốn HỦY đơn hàng này?';
        header = 'Hủy đơn hàng';
        apiCall = this.orderService.cancelOrder(id);
        break;
      default: return;
    }

    this.confirmationService.confirm({
      message: message,
      header: header,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: action === 'cancel' ? 'p-button-danger' : 'p-button-primary',
      accept: () => {
        apiCall.subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật trạng thái' });
            
            // Cập nhật lại UI Dialog ngay lập tức để nút bấm thay đổi theo
            if (this.selectedOrder) {
                // Tự động chuyển status client-side để UI update luôn không cần tắt dialog
                if (action === 'process') this.selectedOrder.status = OrderStatus.Processing;
                if (action === 'ship') this.selectedOrder.status = OrderStatus.Shipping;
                if (action === 'complete') this.selectedOrder.status = OrderStatus.Completed;
                if (action === 'cancel') this.selectedOrder.status = OrderStatus.Cancelled;
            }
            
            // Reload lại bảng danh sách nền
            this.loadOrders(); 
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật trạng thái' });
          }
        });
      }
    });
  }

  getShortId(id: string | undefined | null): string {
    if (!id) return '---';
    return String(id).substring(0, 8).toUpperCase();
  }
}