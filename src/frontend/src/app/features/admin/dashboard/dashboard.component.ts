import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Charts
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table'; // Nếu muốn hiện thêm bảng top sản phẩm

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, TableModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  
  // Data cho biểu đồ
  revenueData: any;
  revenueOptions: any;

  orderStatusData: any;
  orderStatusOptions: any;

  // Mock data: Top sản phẩm bán chạy
  topProducts = [
    { name: 'Áo thun Cotton Basic', sold: 120, revenue: 18000000, image: 'https://placehold.co/50' },
    { name: 'Váy hoa nhí Vintage', sold: 85, revenue: 25500000, image: 'https://placehold.co/50' },
    { name: 'Quần Jeans ống rộng', sold: 60, revenue: 21000000, image: 'https://placehold.co/50' },
    { name: 'Áo sơ mi công sở', sold: 45, revenue: 13500000, image: 'https://placehold.co/50' },
  ];

  ngOnInit() {
    this.initCharts();
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // 1. BIỂU ĐỒ DOANH THU (LINE CHART)
    this.revenueData = {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'],
      datasets: [
        {
          label: 'Doanh thu (Triệu VNĐ)',
          data: [65, 59, 80, 81, 56, 55, 90], // Dữ liệu giả
          fill: true,
          borderColor: '#db2777', // Màu hồng (pink-600)
          backgroundColor: 'rgba(219, 39, 119, 0.1)', // Màu hồng nhạt
          tension: 0.4 // Độ cong của đường
        },
        {
          label: 'Chi phí nhập hàng',
          data: [28, 48, 40, 19, 86, 27, 50],
          fill: true,
          borderColor: '#4b5563', // Màu xám
          backgroundColor: 'rgba(75, 85, 99, 0.05)',
          tension: 0.4,
          borderDash: [5, 5] // Nét đứt
        }
      ]
    };

    this.revenueOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };

    // 2. BIỂU ĐỒ TRẠNG THÁI ĐƠN (DOUGHNUT CHART)
    this.orderStatusData = {
      labels: ['Hoàn thành', 'Đang giao', 'Đã hủy', 'Mới đặt'],
      datasets: [
        {
          data: [300, 50, 20, 100],
          backgroundColor: [
            '#16a34a', // Green (Hoàn thành)
            '#9333ea', // Purple (Đang giao)
            '#dc2626', // Red (Hủy)
            '#2563eb'  // Blue (Mới)
          ],
          hoverBackgroundColor: ['#15803d', '#7e22ce', '#b91c1c', '#1d4ed8']
        }
      ]
    };

    this.orderStatusOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      }
    };
  }
}