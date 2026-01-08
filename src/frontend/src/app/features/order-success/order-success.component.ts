import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './order-success.component.html'
})
export class OrderSuccessComponent implements OnInit {
  today = new Date(); 
  orderInfo: any = null;

  ngOnInit(): void {
    const state = history.state;
    console.log('Order Success State:', state);

    // SỬA: Kiểm tra nếu có 'items' hoặc 'customer' thì coi như hợp lệ
    // Bỏ điều kiện bắt buộc phải có orderId
    if (state && (state.items || state.customer || state.total)) {
      this.orderInfo = state;
    }
  }
}