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
import { SkeletonModule } from 'primeng/skeleton'; // Import Skeleton

// Data & Models
import { Category, Product } from '../../core/models/catalog.models';
import { MOCK_PRODUCTS } from '../../shared/utils/mock-data';
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
  featuredProducts: Product[] = []; // Dữ liệu gốc để lọc
  categories: Category[] = [];

  // Filter States
  selectedCategories: string[] = [];
  priceRange: number[] = [0, 1000000];
  sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá: Thấp đến Cao', value: 'price_asc' },
    { label: 'Giá: Cao đến Thấp', value: 'price_desc' }
  ];
  selectedSort: string = 'newest';

  // UI States (Tách biệt 2 biến loading)
  isLoadingProducts = true; 
  isLoadingCategories = true;
  
  mobileFilterVisible = false;
  totalRecords = 0;
  first = 0;
  rows = 8;

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
    
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategories = [params['categoryId']];
      }
      // Gọi filter ngay khi có params
      this.filterProducts();
    });
  }

  loadFeaturedProducts() {
    this.isLoadingProducts = true;
    this.productService.getProducts(1, 100) // Lấy nhiều hơn để test lọc client-side
      .pipe(finalize(() => {
         // Không set false ở đây ngay, để filterProducts xử lý
      }))
      .subscribe({
        next: (response: any) => {
          if (response.products && Array.isArray(response.products.data)) {
            this.featuredProducts = response.products.data;
          } else {
            this.featuredProducts = [];
          }
          // Sau khi có dữ liệu gốc, chạy filter lần đầu
          this.filterProducts();
        },
        error: (err) => {
            console.error('Lỗi tải sản phẩm:', err);
            this.isLoadingProducts = false;
        }
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

  filterProducts() {
    this.isLoadingProducts = true; // Bật loading của riêng Product

    // Simulate API delay
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

      this.isLoadingProducts = false; // Tắt loading Product
    }, 500);
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
    this.filterProducts();
  }

  getInventoryStatus(product: Product) {
    if (product.quantity === 0) return { label: 'Hết hàng', severity: 'danger' as const };
    else if (product.quantity < 5) return { label: 'Sắp hết', severity: 'warning' as const };
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}