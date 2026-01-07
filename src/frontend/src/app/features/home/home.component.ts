import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category, ProductStatus } from '../../core/models/catalog.models';
import { ProductStatusLabel, ProductStatusSeverity } from '../../shared/utils/product-status.util';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../shared/utils/mock-data';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TagModule,
    SkeletonModule,
    TooltipModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Inject Services (Angular 14+)
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  // Data
  featuredProducts: Product[] = [];
  categories: Category[] = [];

  // Loading States
  isLoadingProducts = true;
  isLoadingCategories = true;

  // Utils cho HTML dùng
  ProductStatus = ProductStatus;

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();

    // this.simulateApiCall();
  }

  simulateApiCall() {
    // Giả vờ load 1.5 giây
    setTimeout(() => {
      this.categories = MOCK_CATEGORIES;
      this.featuredProducts = MOCK_PRODUCTS;

      this.isLoadingCategories = false;
      this.isLoadingProducts = false;
    }, 1500);
  }

  loadFeaturedProducts() {
    this.isLoadingProducts = true;
    // Lấy trang 1, 8 sản phẩm để hiển thị trang chủ
    this.productService.getProducts(1, 8)
      .pipe(finalize(() => this.isLoadingProducts = false))
      .subscribe({
        next: (response: any) => {
          // Chỉ lấy sản phẩm Active (Đang bán) để hiển thị trang chủ
          if (response.products && Array.isArray(response.products.data)) {
            this.featuredProducts = response.products.data;
          } else {
            this.featuredProducts = [];
          }

          // this.featuredProducts = response.data.filter(p => p.status === ProductStatus.Active);
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

  // Hàm helper để lấy badge status (dùng lại util bạn đã có, nhưng xử lý logic hiển thị badge tồn kho)
  getInventoryStatus(product: Product): { label: string, severity: 'success' | 'warning' | 'danger' | 'secondary' | 'info' | 'contrast' } {
    if (product.quantity === 0) {
      return { label: 'Hết hàng', severity: 'danger' };
    } else if (product.quantity < 5) {
      return { label: 'Sắp hết', severity: 'warning' };
    }
    return { label: 'Còn hàng', severity: 'success' };
  }
}