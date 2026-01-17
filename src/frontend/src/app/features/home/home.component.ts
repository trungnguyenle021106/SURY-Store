import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
// BỎ: import { PaginatorModule } from 'primeng/paginator'; -> Không dùng ở Home nữa
import { MessageService } from 'primeng/api';

// Services & Models
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { BasketService } from '../../core/services/basket.service';
import { Product, Category, ProductStatus } from '../../core/models/catalog.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ButtonModule, TagModule,
    SkeletonModule, TooltipModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private basketService = inject(BasketService);
  private messageService = inject(MessageService);

  // Data
  featuredProducts: Product[] = [];
  categories: Category[] = [];

  // Scroll States
  currentPage = 1;
  pageSize = 8;
  totalRecords = 0;
  
  // Loading States
  isLoadingProducts = true;      // Loading lần đầu
  isLoadingMore = false;         // Loading khi cuộn thêm
  isLoadingCategories = true;
  isLastPage = false;            // Kiểm tra đã hết dữ liệu chưa

  ngOnInit(): void {
    this.loadCategories();
    // Load trang 1 ngay khi vào
    this.loadFeaturedProducts(1, false); 
  }

  // Hàm Load sản phẩm (Có tham số isAppend)
  loadFeaturedProducts(page: number, isAppend: boolean = false) {
    if (isAppend) {
        this.isLoadingMore = true;
    } else {
        this.isLoadingProducts = true;
    }

    this.productService.getProducts(page, this.pageSize)
      .pipe(finalize(() => {
        this.isLoadingProducts = false;
        this.isLoadingMore = false;
      }))
      .subscribe({
        next: (response: any) => {
          const newData = response.products?.data || [];
          this.totalRecords = response.products?.count || 0;

          if (isAppend) {
            // Nếu là cuộn thêm -> Nối vào mảng cũ
            this.featuredProducts = [...this.featuredProducts, ...newData];
          } else {
            // Nếu là load lần đầu -> Gán mới
            this.featuredProducts = newData;
          }

          // Kiểm tra xem đã hết dữ liệu chưa
          if (newData.length === 0 || this.featuredProducts.length >= this.totalRecords) {
            this.isLastPage = true;
          }
        },
        error: (err) => console.error('Lỗi tải sản phẩm:', err)
      });
  }

  // Bắt sự kiện cuộn toàn trang
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // 1. Nếu đang loading hoặc đã hết trang -> Dừng
    if (this.isLoadingProducts || this.isLoadingMore || this.isLastPage) return;

    // 2. Tính toán vị trí cuộn (Cách đáy 100px thì load tiếp)
    const threshold = 100;
    const position = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;

    if (position >= height - threshold) {
      this.currentPage++; // Tăng trang
      this.loadFeaturedProducts(this.currentPage, true); // Gọi hàm với isAppend = true
    }
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.categoryService.getCategories(1, 4)
      .pipe(finalize(() => this.isLoadingCategories = false))
      .subscribe({
        next: (res: any) => this.categories = res.categories?.data || [],
        error: (err) => console.error(err)
      });
  }

  addToCart(product: Product) {
    if (!product) return;
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã thêm ${product.name} vào giỏ!`, life: 3000 });
    this.basketService.addItemToBasket(product, 1).subscribe();
  }

  getInventoryStatus(product: Product) {
    if (product.quantity === 0) return { label: 'Hết hàng', severity: 'danger' as const };
    else if (product.quantity < 5) return { label: 'Sắp hết', severity: 'warning' as const };
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}