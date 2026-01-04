import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Nhớ import CommonModule để dùng *ngIf, *ngFor
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-order-success',
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './order-success.component.html'
})
export class OrderSuccessComponent implements OnInit {
  private router = inject(Router);

  orderInfo: any = null;

  ngOnInit(): void {
    // Lấy dữ liệu được gửi từ trang Checkout
    const state = history.state;
    
    // Kiểm tra xem có dữ liệu không (tránh trường hợp user F5 hoặc vào trực tiếp link)
    if (state && state.orderId) {
      this.orderInfo = state;
    }
  }
}