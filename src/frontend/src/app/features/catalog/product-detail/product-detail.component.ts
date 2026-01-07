import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models & Data
import { Product } from '../../../core/models/catalog.models';
import { MOCK_PRODUCTS } from '../../../shared/utils/mock-data';
import { ProductService } from '../../../core/services/product.service';
import { BasketService } from '../../../core/services/basket.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    ButtonModule, InputNumberModule, TagModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private productService = inject(ProductService);
  private basketService = inject(BasketService);

  product: Product | null = null;
  relatedProducts: Product[] = []; // Vẫn giữ gợi ý SP khác để khách không bị "cụt đường"
  quantity: number = 1;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.loadProduct(id);
    });
  }

  loadMockProduct(id: string | null) {
    if (!id) return;

    const found = MOCK_PRODUCTS.find(p => p.id === id);
    if (found) {
      this.product = found;
      this.quantity = 1;

      // Lấy 4 sản phẩm gợi ý (trừ sản phẩm đang xem)
      this.relatedProducts = MOCK_PRODUCTS.filter(p => p.id !== id).slice(0, 4);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadProduct(id: string | null) {
    if (!id) return;

    // 1. Lấy thông tin sản phẩm chính
    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        this.product = product;

        // 2. Gọi API lấy sản phẩm tương tự
        // Logic: Lấy trang 1, 4 phần tử, không keyword, cùng categoryId, trừ id hiện tại
        this.loadRelatedProducts(product.categoryId, product.id);

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  loadRelatedProducts(categoryId: string, currentProductId: string) {
    this.productService.getProducts(1, 4, undefined, categoryId, currentProductId)
      .subscribe({
        next: (response: any) => {
          // API trả về response bọc trong PaginatedResult, nên lấy .data hoặc .items tùy model
          if (response.products && Array.isArray(response.products.data)) {
            this.relatedProducts = response.products.data;
          } else {
            this.relatedProducts = [];
          }
        }
      });
  }

addToCart() {
    if (!this.product) return;

    // --- BƯỚC 1: KIỂM TRA TỒN KHO THỰC TẾ (Kết hợp với giỏ hàng) ---
    
    // Lấy thông tin giỏ hàng hiện tại (Signal)
    const currentCart = this.basketService.cart();
    
    // Tìm xem sản phẩm này đã có trong giỏ chưa
    const existingItem = currentCart?.items.find(i => i.productId === this.product!.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    // Tổng số lượng khách muốn mua (Đã có trong giỏ + Đang muốn thêm)
    const totalRequested = currentQtyInCart + this.quantity;

    // Nếu tổng vượt quá số lượng tồn kho của sản phẩm
    if (totalRequested > this.product.quantity) {
      // Tính số lượng còn có thể thêm được
      const availableToAdd = Math.max(0, this.product.quantity - currentQtyInCart);

      if (availableToAdd === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Đạt giới hạn số lượng',
          detail: `Bạn đã thêm toàn bộ số lượng có sẵn (${this.product.quantity}) vào giỏ hàng rồi.`
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Vượt quá tồn kho',
          detail: `Bạn đã có ${currentQtyInCart} cái trong giỏ. Chỉ có thể thêm tối đa ${availableToAdd} cái nữa.`
        });
        
        // (Optional) Tự động sửa lại số lượng input về số tối đa có thể mua giúp khách
        this.quantity = availableToAdd; 
      }
      
      return; // DỪNG LẠI NGAY, KHÔNG GỌI SERVICE
    }

    // --- BƯỚC 2: LOGIC CŨ (NẾU HỢP LỆ) ---

    // Hiện thông báo thành công (Optimistic UI)
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã thêm ${this.quantity} ${this.product.name} vào giỏ!`,
      life: 3000
    });

    // Gọi Service xử lý
    this.basketService.addItemToBasket(this.product, this.quantity).subscribe({
      next: () => {
        // API thành công
      },
      error: (err) => {
        console.error('Lỗi đồng bộ giỏ hàng:', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Kết nối không ổn định',
          detail: 'Sản phẩm đã được lưu tạm vào máy, nhưng chưa đồng bộ được với hệ thống.',
          life: 5000
        });
      }
    });
  }

  // Helper hiển thị trạng thái text
  get inventoryStatus() {
    if (!this.product) return { label: '', severity: 'secondary' as const };
    if (this.product.quantity === 0) return { label: 'Hết hàng', severity: 'danger' as const };
    if (this.product.quantity < 5) return { label: 'Sắp hết hàng', severity: 'warning' as const };
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}