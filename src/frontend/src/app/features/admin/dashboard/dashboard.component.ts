import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { OrderSummary, OrderStatus } from '../../../core/models/ordering.models';

import { forkJoin } from 'rxjs';
import { Product } from '../../../core/models/catalog.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, TableModule],
  templateUrl: './dashboard.component.html',
  providers: [CurrencyPipe]
})
export class DashboardComponent implements OnInit {
  
  private orderService = inject(OrderService);
  private productService = inject(ProductService);

  // Stats
  totalRevenue: number = 0;
  totalOrders: number = 0;
  pendingOrdersCount: number = 0; // Đổi tên biến cho rõ nghĩa
  completedOrdersCount: number = 0;
  conversionRate: number = 0;

  // Charts
  revenueData: any;
  revenueOptions: any;
  orderStatusData: any;
  orderStatusOptions: any;

  // Table
  recentProducts: Product[] = [];

  ngOnInit() {
    this.initChartOptions();
    this.loadDashboardData();
  }

  loadDashboardData() {
    const orders$ = this.orderService.getOrdersForAdmin(1, 1000); 
    const products$ = this.productService.getProducts(1, 5);

    forkJoin([orders$, products$]).subscribe({
      next: ([orderRes, productRes]) => {
        const orders = orderRes.data;
        this.calculateStats(orders);
        this.updateRevenueChart(orders);
        this.updateOrderStatusChart(orders);
        this.recentProducts = productRes.data;
      },
      error: (err) => console.error('Dashboard error:', err)
    });
  }

  calculateStats(orders: OrderSummary[]) {
    this.totalOrders = orders.length;

    // 1. Tính doanh thu: Chỉ tính đơn Hoàn thành (Completed = 4)
    // Hoặc tính cả đơn Đang giao (Shipping = 3) tùy logic của bạn. 
    // Ở đây tôi chọn chỉ tính Completed cho chắc chắn.
    this.totalRevenue = orders
      .filter(o => o.status === OrderStatus.Completed)
      .reduce((sum, curr) => sum + curr.totalPrice, 0);

    // 2. Đếm đơn chờ xác nhận (Pending = 1)
    // Lưu ý: Cần ép kiểu về số nếu BE trả về chuỗi số "1"
    this.pendingOrdersCount = orders.filter(o => Number(o.status) === OrderStatus.Pending).length;

    // 3. Tỉ lệ hoàn thành (Completed / Tổng)
    this.completedOrdersCount = orders.filter(o => Number(o.status) === OrderStatus.Completed).length;
    
    this.conversionRate = this.totalOrders > 0 
      ? (this.completedOrdersCount / this.totalOrders) * 100 
      : 0;
  }

  updateRevenueChart(orders: OrderSummary[]) {
    const monthlyRevenue = new Array(12).fill(0);

    orders.forEach(order => {
      // Chỉ vẽ biểu đồ với các đơn chắc chắn có tiền (Completed)
      if (Number(order.status) === OrderStatus.Completed) {
        const date = new Date(order.orderDate);
        if (!isNaN(date.getTime())) { // Kiểm tra ngày hợp lệ
           monthlyRevenue[date.getMonth()] += order.totalPrice;
        }
      }
    });

    const dataInMillions = monthlyRevenue.map(val => val / 1000000);

    this.revenueData = {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      datasets: [
        {
          label: 'Doanh thu thực tế (Triệu VNĐ)',
          data: dataInMillions,
          fill: true,
          borderColor: '#db2777',
          backgroundColor: 'rgba(219, 39, 119, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  updateOrderStatusChart(orders: OrderSummary[]) {
    // Reset bộ đếm
    const counts = {
      pending: 0,    // 1
      processing: 0, // 2
      shipping: 0,   // 3
      completed: 0,  // 4
      cancelled: 0,  // 5
      outOfStock: 0  // 6
    };

    orders.forEach(o => {
      const s = Number(o.status); // Ép kiểu cho an toàn
      switch (s) {
        case OrderStatus.Pending: counts.pending++; break;
        case OrderStatus.Processing: counts.processing++; break;
        case OrderStatus.Shipping: counts.shipping++; break;
        case OrderStatus.Completed: counts.completed++; break;
        case OrderStatus.Cancelled: counts.cancelled++; break;
        case OrderStatus.OutOfStock: counts.outOfStock++; break;
      }
    });

    this.orderStatusData = {
      labels: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy', 'Hết hàng'],
      datasets: [
        {
          data: [
            counts.pending, 
            counts.processing, 
            counts.shipping, 
            counts.completed, 
            counts.cancelled,
            counts.outOfStock
          ],
          backgroundColor: [
            '#3b82f6', // Pending (Blue)
            '#f59e0b', // Processing (Orange)
            '#9333ea', // Shipping (Purple)
            '#22c55e', // Completed (Green)
            '#ef4444', // Cancelled (Red)
            '#6b7280'  // OutOfStock (Gray)
          ]
        }
      ]
    };
  }

  initChartOptions() {
     // ... giữ nguyên như cũ
     const documentStyle = getComputedStyle(document.documentElement);
     const textColor = documentStyle.getPropertyValue('--text-color');
     const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

     this.revenueOptions = {
       maintainAspectRatio: false,
       aspectRatio: 0.6,
       plugins: { legend: { labels: { color: textColor } } },
       scales: {
         x: { ticks: { color: textColor }, grid: { color: surfaceBorder, drawBorder: false } },
         y: { ticks: { color: textColor }, grid: { color: surfaceBorder, drawBorder: false } }
       }
     };

     this.orderStatusOptions = {
       cutout: '60%',
       plugins: { legend: { labels: { color: textColor } } }
     };
  }
}