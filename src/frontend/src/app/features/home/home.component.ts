import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast'; // [MỚI] Để hiển thị thông báo
import { MessageService } from 'primeng/api'; // [MỚI] Service thông báo

// Services & Models
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { BasketService } from '../../core/services/basket.service'; // [MỚI] Service giỏ hàng
import { Product, Category, ProductStatus } from '../../core/models/catalog.models';
import { ProductStatusLabel, ProductStatusSeverity } from '../../shared/utils/product-status.util';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../shared/utils/mock-data';

@Component({
  selector: 'app-home',
  standalone: true, // Angular 17+ thường dùng standalone
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    ToastModule // [MỚI]
  ],
  providers: [MessageService], // [MỚI] Cung cấp service tại component
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Inject Services
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private basketService = inject(BasketService); // [MỚI]
  private messageService = inject(MessageService); // [MỚI]

  // Data
  featuredProducts: Product[] = [];
  categories: Category[] = [];

  // Loading States
  isLoadingProducts = true;
  isLoadingCategories = true;

  // Utils
  ProductStatus = ProductStatus;

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  loadFeaturedProducts() {
    this.isLoadingProducts = true;
    this.productService.getProducts(1, 8)
      .pipe(finalize(() => this.isLoadingProducts = false))
      .subscribe({
        next: (response: any) => {
          if (response.products && Array.isArray(response.products.data)) {
            this.featuredProducts = response.products.data;
          } else {
            this.featuredProducts = [];
          }
        },
        error: (err) => console.error('Lỗi tải sản phẩm:', err)
      });
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.categoryService.getCategories(1, 4)
      .pipe(finalize(() => this.isLoadingCategories = false))
      .subscribe({
        next: (response: any) => {
          if (response.categories && Array.isArray(response.categories.data)) {
            this.categories = response.categories.data;
          } else {
            this.categories = [];
          }
        },
        error: (err) => console.error('Lỗi tải danh mục:', err)
      });
  }

  // [MỚI] Hàm thêm vào giỏ hàng
  addToCart(product: Product) {
    if (!product) return;

    // Logic: Thêm 1 sản phẩm, bỏ qua check tồn kho như yêu cầu
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã thêm 1 ${product.name} vào giỏ!`,
      life: 3000
    });

    this.basketService.addItemToBasket(product, 1).subscribe({
      next: () => {
        // API thành công (ngầm)
      },
      error: (err) => {
        console.error('Lỗi đồng bộ giỏ hàng:', err);
        // Có thể thêm thông báo lỗi nếu cần thiết
      }
    });
  }

  getInventoryStatus(product: Product): { label: string, severity: 'success' | 'warning' | 'danger' | 'secondary' | 'info' | 'contrast' } {
    if (product.quantity === 0) {
      return { label: 'Hết hàng', severity: 'danger' };
    } else if (product.quantity < 5) {
      return { label: 'Sắp hết', severity: 'warning' };
    }
    return { label: 'Còn hàng', severity: 'success' };
  }
}