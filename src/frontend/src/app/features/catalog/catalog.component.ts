import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { SidebarModule } from 'primeng/sidebar';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

// Data & Models
import { Category, Product } from '../../core/models/catalog.models';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'app-catalog',
  imports: [
    CommonModule, RouterLink, FormsModule,
    ButtonModule, DropdownModule, SliderModule, CheckboxModule,
    SidebarModule, TagModule, PaginatorModule, TooltipModule, SkeletonModule
  ],
  templateUrl: './catalog.component.html',
  styles: [`
    .filter-scroll::-webkit-scrollbar { width: 4px; }
    .filter-scroll::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 4px; }
  `]
})
export class CatalogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  // Data
  products: Product[] = [];        
  featuredProducts: Product[] = []; 
  categories: Category[] = [];

  // Filter States
  selectedCategories: string[] = [];
  priceRange: number[] = [0, 1000000];
  keyword: string = ''; // Thêm biến keyword

  sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá: Thấp đến Cao', value: 'price_asc' },
    { label: 'Giá: Cao đến Thấp', value: 'price_desc' }
  ];
  selectedSort: string = 'newest';

  // UI States
  isLoadingProducts = true; 
  isLoadingCategories = true;
  
  mobileFilterVisible = false;
  totalRecords = 0;
  first = 0;
  rows = 8;

  ngOnInit(): void {
    this.loadCategories();
    
    // Lắng nghe URL thay đổi để load lại dữ liệu
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || ''; // Lấy keyword từ URL
      
      if (params['categoryId']) {
        this.selectedCategories = [params['categoryId']];
      } else {
        // Nếu không có categoryId trên URL thì reset (trừ khi bạn muốn giữ state)
        // this.selectedCategories = []; 
      }
      
      // Load sản phẩm dựa trên keyword (nếu có)
      this.loadFeaturedProducts(this.keyword);
    });
  }

  // Cập nhật hàm này để nhận keyword
  loadFeaturedProducts(searchKeyword: string = '') {
    this.isLoadingProducts = true;
    
    // Gọi API với keyword. Giả sử getProducts hỗ trợ tham số thứ 3 là keyword
    // Nếu API bạn là getProducts(page, size, keyword)
    this.productService.getProducts(1, 100, searchKeyword) 
      .pipe(finalize(() => {
         // Loading sẽ được tắt trong filterProducts
      }))
      .subscribe({
        next: (response: any) => {
          if (response.products && Array.isArray(response.products.data)) {
            this.featuredProducts = response.products.data;
          } else if (response.data && Array.isArray(response.data)) {
             // Fallback nếu response trả về trực tiếp data (tùy cấu trúc API)
             this.featuredProducts = response.data;
          } else {
            this.featuredProducts = [];
          }
          // Chạy filter client-side trên tập dữ liệu vừa lấy về
          this.filterProducts();
        },
        error: (err) => {
            console.error('Lỗi tải sản phẩm:', err);
            this.featuredProducts = [];
            this.isLoadingProducts = false;
        }
      });
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.categoryService.getCategories(1, 100) // Lấy nhiều hơn để hiện đủ filter
      .pipe(finalize(() => this.isLoadingCategories = false))
      .subscribe({
        next: (response: any) => {
          if (response.categories && Array.isArray(response.categories.data)) {
            this.categories = response.categories.data;
          } else if (response.data) {
             this.categories = response.data;
          } else {
            this.categories = [];
          }
        },
        error: (err) => console.error('Lỗi tải danh mục:', err)
      });
  }

  filterProducts() {
    this.isLoadingProducts = true; 

    // Simulate delay for client-side filtering effect
    setTimeout(() => {
      let result = [...this.featuredProducts];

      // 1. Filter Category
      if (this.selectedCategories.length > 0) {
        result = result.filter(p => this.selectedCategories.includes(p.categoryId));
      }

      // 2. Filter Price
      result = result.filter(p => p.price >= this.priceRange[0] && p.price <= this.priceRange[1]);

      // 3. Sort
      if (this.selectedSort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (this.selectedSort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
      }

      this.totalRecords = result.length;

      // 4. Pagination
      const start = this.first;
      const end = this.first + this.rows;
      this.products = result.slice(start, end);

      this.isLoadingProducts = false; 
    }, 300);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.filterProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters() {
    this.selectedCategories = [];
    this.priceRange = [0, 1000000];
    // Không clear keyword ở đây nếu bạn muốn giữ kết quả tìm kiếm nhưng bỏ bộ lọc giá/danh mục
    // Nếu muốn clear cả tìm kiếm:
    // this.keyword = ''; 
    // this.router.navigate([], { queryParams: {} }); 
    this.filterProducts();
  }

  getInventoryStatus(product: Product) {
    if (product.quantity === 0) return { label: 'Hết hàng', severity: 'danger' as const };
    else if (product.quantity < 5) return { label: 'Sắp hết', severity: 'warning' as const };
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}