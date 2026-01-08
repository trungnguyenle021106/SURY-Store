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
  relatedProducts: Product[] = [];
  quantity: number = 1;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.loadProduct(id);
    });
  }

  loadProduct(id: string | null) {
    if (!id) return;

    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        this.product = product;
        this.loadRelatedProducts(product.categoryId, product.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  loadRelatedProducts(categoryId: string, currentProductId: string) {
    this.productService.getProducts(1, 4, undefined, categoryId, currentProductId)
      .subscribe({
        next: (response: any) => {
          if (response.products && Array.isArray(response.products.data)) {
            this.relatedProducts = response.products.data;
          } else {
            this.relatedProducts = [];
          }
        }
      });
  }

  // --- HÀM NÀY ĐÃ ĐƯỢC SỬA ---
  addToCart() {
    if (!this.product) return;

    // ĐÃ XÓA: Đoạn code kiểm tra tồn kho (currentCart, totalRequested...)
    // Bây giờ cho phép mua tẹt ga, bất kể kho còn bao nhiêu.

    // Hiện thông báo thành công
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

  get inventoryStatus() {
    if (!this.product) return { label: '', severity: 'secondary' as const };
    if (this.product.quantity === 0) return { label: 'Hết hàng', severity: 'danger' as const };
    if (this.product.quantity < 5) return { label: 'Sắp hết hàng', severity: 'warning' as const };
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}