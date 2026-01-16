import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator'; // [MỚI] Import Paginator
import { MessageService } from 'primeng/api';

// Services & Models
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { BasketService } from '../../core/services/basket.service';
import { Product, Category, ProductStatus } from '../../core/models/catalog.models';
import { ProductStatusLabel, ProductStatusSeverity } from '../../shared/utils/product-status.util';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    ToastModule,
    PaginatorModule // [MỚI] Thêm vào imports
  ],
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Inject Services
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private basketService = inject(BasketService);
  private messageService = inject(MessageService);

  // Data
  featuredProducts: Product[] = [];
  categories: Category[] = [];

  // Pagination States [MỚI]
  first: number = 0;        // Vị trí phần tử đầu tiên (0-based)
  rows: number = 8;         // Số lượng hiển thị mỗi trang (giữ nguyên logic cũ của bạn)
  totalRecords: number = 0; // Tổng số sản phẩm (lấy từ API)

  // Loading States
  isLoadingProducts = true;
  isLoadingCategories = true;

  // Utils
  ProductStatus = ProductStatus;

  ngOnInit(): void {
    this.loadFeaturedProducts(1); // Mặc định tải trang 1
    this.loadCategories();
  }

  // [CẬP NHẬT] Thêm tham số page
  loadFeaturedProducts(pageNumber: number) {
    this.isLoadingProducts = true;
    
    // Gọi API với pageNumber động và this.rows
    this.productService.getProducts(pageNumber, this.rows)
      .pipe(finalize(() => this.isLoadingProducts = false))
      .subscribe({
        next: (response: any) => {
          if (response.products && Array.isArray(response.products.data)) {
            this.featuredProducts = response.products.data;
            // [MỚI] Cập nhật tổng số bản ghi để Paginator tính toán số trang
            this.totalRecords = response.products.count; 
          } else {
            this.featuredProducts = [];
            this.totalRecords = 0;
          }
        },
        error: (err) => console.error('Lỗi tải sản phẩm:', err)
      });
  }

  // [MỚI] Xử lý sự kiện khi bấm chuyển trang
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    
    // Tính toán số trang (API của bạn dùng 1-based index)
    const pageNumber = (event.first / event.rows) + 1;
    
    this.loadFeaturedProducts(pageNumber);
    
    // Cuộn nhẹ lên đầu danh sách sản phẩm cho trải nghiệm tốt hơn (tuỳ chọn)
    // document.getElementById('new-products-section')?.scrollIntoView({ behavior: 'smooth' });
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

  addToCart(product: Product) {
    if (!product) return;
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã thêm 1 ${product.name} vào giỏ!`,
      life: 3000
    });
    this.basketService.addItemToBasket(product, 1).subscribe({
      next: () => {},
      error: (err) => console.error('Lỗi đồng bộ giỏ hàng:', err)
    });
  }

  getInventoryStatus(product: Product) {
    if (product.quantity === 0) {
      return { label: 'Hết hàng', severity: 'danger' as const }; // Thêm 'as const' để fix type
    } else if (product.quantity < 5) {
      return { label: 'Sắp hết', severity: 'warning' as const };
    }
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}