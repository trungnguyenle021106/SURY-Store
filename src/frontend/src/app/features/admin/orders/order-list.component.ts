import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports (Giữ nguyên)
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

import { OrderService } from '../../../core/services/order.service';
import { OrderDetail, OrderSummary, OrderStatus } from '../../../core/models/ordering.models';
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

  // Data
  orders: OrderSummary[] = [];
  totalRecords = 0;
  isLoading = false;
  
  // Infinite Scroll State
  isLastPage = false; // Kiểm tra đã hết dữ liệu chưa

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
  getStatusLabel = (s: any) => OrderStatusLabel[parseOrderStatus(s)];
  getStatusSeverity = (s: any) => OrderStatusSeverity[parseOrderStatus(s)];
  getShortId(id: string | undefined | null): string {
    if (!id) return '---';
    return String(id).substring(0, 8).toUpperCase();
  }

  ngOnInit(): void {
    // Tải dữ liệu lần đầu
    this.loadOrders();
  }

  // --- 1. CORE: Load Orders (Đã sửa cho Infinite Scroll) ---
  loadOrders(event?: any, isAppend: boolean = false) {
    if (this.isLoading) return; // Chặn spam request
    
    this.isLoading = true;

    // Nếu không phải là "Nối thêm" (tức là Search, Filter, hoặc Refresh) -> Reset về trang 1
    if (!isAppend) {
        this.currentPage = 1;
        this.orders = [];
        this.isLastPage = false;
    }

    this.orderService.getOrdersForAdmin(
      this.currentPage,
      this.pageSize,
      this.selectedStatus ?? undefined,
      this.searchTerm
    ).subscribe({
      next: (res) => {
        const newOrders = res.data;
        this.totalRecords = res.count;

        // Logic nối mảng
        if (isAppend) {
            this.orders = [...this.orders, ...newOrders];
        } else {
            this.orders = newOrders;
        }

        // Kiểm tra xem đã hết dữ liệu chưa
        if (newOrders.length === 0 || this.orders.length >= this.totalRecords) {
            this.isLastPage = true;
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Nếu load lần đầu lỗi thì xóa mảng, còn load thêm lỗi thì giữ nguyên
        if (!isAppend) this.orders = []; 
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tải được danh sách đơn hàng' });
      }
    });
  }

  // --- 2. Sự kiện cuộn (Scroll Event) ---
  onScroll(event: any) {
    if (this.isLoading || this.isLastPage) return;

    const element = event.target;
    // Nếu cuộn gần tới đáy (còn 50px)
    if (element.offsetHeight + element.scrollTop >= element.scrollHeight - 50) {
       this.currentPage++;
       this.loadOrders(null, true); // Gọi load với isAppend = true
    }
  }

  // --- 3. Wrapper cho Search/Filter (Gọi reset) ---
  onFilterChange() {
      this.loadOrders(null, false);
  }

  // ... Các hàm viewOrder, changeStatus giữ nguyên logic cũ ...
  viewOrder(orderId: string) {
    this.displayDialog = true;
    this.isLoadingDetail = true;
    this.selectedOrder = null;

    this.orderService.getOrderById(orderId).subscribe({
      next: (res: any) => {
        const rawData = res.order || res;
        this.selectedOrder = {
            ...rawData,
            status: parseOrderStatus(rawData.status) 
        };
        this.isLoadingDetail = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tải được chi tiết' });
        this.displayDialog = false;
        this.isLoadingDetail = false;
      }
    });
  }

  changeStatus(action: 'process' | 'ship' | 'complete' | 'cancel') {
    if (!this.selectedOrder) return;
    const id = this.selectedOrder.id;
    let message = '', header = 'Xác nhận', apiCall;

    switch (action) {
      case 'process': message = 'Chuyển sang Đang xử lý?'; apiCall = this.orderService.startProcessing(id); break;
      case 'ship': message = 'Đã bàn giao cho Shipper?'; apiCall = this.orderService.shipOrder(id); break;
      case 'complete': message = 'Khách đã nhận và thanh toán?'; apiCall = this.orderService.completeOrder(id); break;
      case 'cancel': message = 'HỦY đơn hàng này?'; header = 'Hủy đơn'; apiCall = this.orderService.cancelOrder(id); break;
      default: return;
    }

    this.confirmationService.confirm({
      message, header, icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Đồng ý', rejectLabel: 'Hủy',
      acceptButtonStyleClass: action === 'cancel' ? 'p-button-danger' : 'p-button-primary',
      accept: () => {
        apiCall.subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật trạng thái' });
            
            // Cập nhật UI Dialog
            if (this.selectedOrder) {
                if (action === 'process') this.selectedOrder.status = OrderStatus.Processing;
                if (action === 'ship') this.selectedOrder.status = OrderStatus.Shipping;
                if (action === 'complete') this.selectedOrder.status = OrderStatus.Completed;
                if (action === 'cancel') this.selectedOrder.status = OrderStatus.Cancelled;
                
                // Cập nhật luôn trong danh sách bên ngoài để đỡ phải reload lại từ đầu (mất vị trí cuộn)
                const itemIndex = this.orders.findIndex(o => o.id === id);
                if (itemIndex !== -1) {
                    this.orders[itemIndex].status = this.selectedOrder.status;
                }
            }
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật' })
        });
      }
    });
  }
}