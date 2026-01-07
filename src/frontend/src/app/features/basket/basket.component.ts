import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services & Models
import { BasketService } from '../../core/services/basket.service';
import { CartItem } from '../../core/models/basket.models';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    ButtonModule, InputNumberModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './basket.component.html'
})
export class BasketComponent {
  // Inject Service
  basketService = inject(BasketService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // Không cần ngOnInit để load fake data nữa
  // Service đã tự động load từ LocalStorage ngay khi khởi tạo

  /**
   * Xử lý khi người dùng thay đổi số lượng (+/-)
   * Thay vì viết lại logic update, ta tận dụng hàm addItemToBasket của Service
   * bằng cách tính độ lệch (diff).
   */
  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) return;

    const currentQty = item.quantity;
    const diff = newQuantity - currentQty;

    if (diff === 0) return;

    // Mapping lại từ CartItem sang object Product mà Service yêu cầu
    // Vì addItemToBasket mong đợi { id, name, imageUrl... }
    const productRef = {
      id: item.productId,
      name: item.productName,
      price: item.price,
      imageUrl: item.pictureUrl
    };

    // Gọi Service:
    // Nếu diff > 0 (vd: tăng từ 1 lên 3 -> diff = 2) -> Service cộng thêm 2
    // Nếu diff < 0 (vd: giảm từ 3 xuống 1 -> diff = -2) -> Service trừ đi 2
    this.basketService.addItemToBasket(productRef, diff).subscribe({
      error: () => {
        this.messageService.add({ 
            severity: 'warn', 
            summary: 'Lỗi đồng bộ', 
            detail: 'Không thể cập nhật số lượng lên máy chủ.' 
        });
        // Lưu ý: UI vẫn hiển thị số mới nhờ Optimistic Update trong Service,
        // nhưng thông báo này giúp User biết mạng đang có vấn đề.
      }
    });
  }

  removeItem(productId: string) {
    this.basketService.removeItemFromBasket(productId).subscribe({
      next: () => {
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Đã xóa', 
            detail: 'Sản phẩm đã được xóa khỏi giỏ hàng' 
        });
      },
      error: () => {
         this.messageService.add({ 
            severity: 'warn', 
            summary: 'Offline', 
            detail: 'Đã xóa ở máy bạn, nhưng chưa đồng bộ được Server' 
        });
      }
    });
  }

  // Hàm chuyển hướng đến trang thanh toán
  goToCheckout() {
    const cart = this.basketService.cart();
    if (!cart || cart.items.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'Giỏ hàng trống', detail: 'Vui lòng chọn sản phẩm trước!' });
        return;
    }
    this.router.navigate(['/checkout']);
  }
}