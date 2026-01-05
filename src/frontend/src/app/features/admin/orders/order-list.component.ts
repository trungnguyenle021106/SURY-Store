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
import { OrderStatusLabel, OrderStatusSeverity } from '../../../shared/utils/order-status.util';

@Component({
  selector: 'app-order-list',
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

  // Data List (Dùng OrderSummary)
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

  // Detail Dialog (Dùng OrderDetail)
  displayDialog = false;
  selectedOrder: OrderDetail | null = null;
  isLoadingDetail = false;

  // Utils
  OrderStatus = OrderStatus;
  getStatusLabel = (s: number) => OrderStatusLabel[s];
  getStatusSeverity = (s: number) => OrderStatusSeverity[s];

  ngOnInit(): void {
    this.loadOrders();
  }

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
        // Model AdminOrderListResponse kế thừa PaginatedResult<OrderSummary>
        // nên dữ liệu nằm trong res.data
        this.orders = res.data;
        this.totalRecords = res.count;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.orders = [];
      }
    });
  }

  // 2. Xem chi tiết
  viewOrder(orderId: string) {
    this.displayDialog = true;
    this.isLoadingDetail = true;
    this.selectedOrder = null;

    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        this.selectedOrder = res; // res là OrderDetail
        this.isLoadingDetail = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tải được chi tiết đơn hàng' });
        this.displayDialog = false;
      }
    });
  }

  // 3. Xử lý trạng thái (Giữ nguyên logic cũ nhưng map đúng ID)
  changeStatus(action: string) {
    if (!this.selectedOrder) return;
    const id = this.selectedOrder.id; // Dùng ID (Guid) để gọi API

    let message = '';
    let apiCall;

    switch (action) {
      case 'process': // Submitted -> Processing/StockConfirmed
        message = 'Xác nhận đơn hàng và chuẩn bị hàng?';
        apiCall = this.orderService.startProcessing(id);
        break;
      case 'ship': // StockConfirmed -> Shipped
        message = 'Xác nhận giao cho Shipper?';
        apiCall = this.orderService.shipOrder(id);
        break;
      case 'complete': // Shipped -> Completed
        message = 'Xác nhận đơn hàng đã hoàn thành?';
        apiCall = this.orderService.completeOrder(id);
        break;
      case 'cancel':
        message = 'Bạn có chắc chắn muốn HỦY đơn hàng này?';
        apiCall = this.orderService.cancelOrder(id);
        break;
      default: return;
    }

    this.confirmationService.confirm({
      message: message,
      header: 'Xác nhận thao tác',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: action === 'cancel' ? 'p-button-danger' : 'p-button-primary',
      accept: () => {
        apiCall.subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật trạng thái thành công' });
            this.displayDialog = false;
            this.loadOrders();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật trạng thái' })
        });
      }
    });
  }
}