import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table'; // Dùng table hoặc div tùy ý, ở đây tôi dùng div cho flexible
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services & Models
import { BasketService } from '../../core/services/basket.service';
import { CartItem } from '../../core/models/basket.models';

@Component({
  selector: 'app-basket',
  imports: [
    CommonModule, RouterLink, FormsModule,
    ButtonModule, InputNumberModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './basket.component.html'
})
export class BasketComponent implements OnInit {
  basketService = inject(BasketService); // Inject public để dùng trực tiếp trong HTML
  private messageService = inject(MessageService);

  ngOnInit(): void {
    // Gọi API lấy giỏ hàng thật (sẽ lỗi nếu chưa có backend)
    // this.getBasket();

    // MẸO: Tự động nạp dữ liệu giả để test giao diện ngay (Xóa dòng này khi có Backend thật)
    this.loadFakeData();
  }

  getBasket() {
    this.basketService.getBasket().subscribe({
      error: () => console.log('Chưa có backend, hãy dùng dữ liệu giả')
    });
  }

  // Cập nhật số lượng khi bấm +/-
  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) return;

    // Lấy danh sách hiện tại
    const currentCart = this.basketService.cart();
    if (!currentCart) return;

    // Tạo mảng items mới với số lượng đã thay đổi
    const newItems = currentCart.items.map(i => {
      if (i.productId === item.productId) {
        return { ...i, quantity: newQuantity };
      }
      return i;
    });

    // Gọi Service cập nhật (Service sẽ lo việc tính lại tổng tiền)
    this.basketService.updateBasket(newItems).subscribe({
      next: () => {
        // Có thể hiện thông báo nhỏ nếu muốn
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật giỏ hàng' })
    });
  }

  removeItem(productId: string) {
    this.basketService.removeItemFromBasket(productId);
    this.messageService.add({ severity: 'info', summary: 'Đã xóa', detail: 'Đã xóa sản phẩm khỏi giỏ' });
  }

  // --- HÀM TẠO DỮ LIỆU GIẢ ĐỂ TEST UI (KHÔNG CẦN BACKEND) ---
  loadFakeData() {
    const fakeItems: CartItem[] = [
      {
        productId: 'p1',
        productName: 'Áo Blouse Cổ Nơ Tinh Tế',
        price: 250000,
        quantity: 2,
        pictureUrl: 'https://placehold.co/400x533/fdf4ff/86198f?text=Ao+Blouse'
      },
      {
        productId: 'p2',
        productName: 'Chân Váy Xếp Ly Dáng Dài',
        price: 320000,
        quantity: 1,
        pictureUrl: 'https://placehold.co/400x533/fdf4ff/86198f?text=Chan+Vay'
      }
    ];
    // Hack: Gọi trực tiếp hàm update của service để set signal
    this.basketService.setLocalCart(fakeItems);

    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Test Mode',
        detail: 'Đã nạp dữ liệu giả thành công!',
        life: 5000 // Tự tắt sau 3 giây
      });
    }, 3000); // Chờ 300ms (0.3 giây) là đẹp
  }
}