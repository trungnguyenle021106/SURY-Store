import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { SidebarModule } from 'primeng/sidebar'; // Mobile Filter
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

// Data & Models
import { Category, Product } from '../../core/models/catalog.models';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../shared/utils/mock-data';


@Component({
  selector: 'app-catalog',
  imports: [
    CommonModule, RouterLink, FormsModule,
    ButtonModule, DropdownModule, SliderModule, CheckboxModule,
    SidebarModule, TagModule, PaginatorModule, TooltipModule
  ],
  templateUrl: './catalog.component.html',
  styles: [`
    /* Ẩn thanh cuộn mặc định của sidebar filter nếu dài */
    .filter-scroll::-webkit-scrollbar { width: 4px; }
    .filter-scroll::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 4px; }
  `]
})
export class CatalogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Data
  products: Product[] = [];        // Danh sách hiển thị
  allProducts: Product[] = MOCK_PRODUCTS; // Danh sách gốc (Mock DB)
  categories: Category[] = MOCK_CATEGORIES;
  
  // Filter States
  selectedCategories: string[] = [];
  priceRange: number[] = [0, 1000000]; // 0đ - 1 triệu
  sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá: Thấp đến Cao', value: 'price_asc' },
    { label: 'Giá: Cao đến Thấp', value: 'price_desc' }
  ];
  selectedSort: string = 'newest';
  
  // UI States
  isLoading = false;
  mobileFilterVisible = false;
  totalRecords = 0;
  first = 0; // Pagination state
  rows = 8;  // Số SP mỗi trang

  ngOnInit(): void {
    // Lắng nghe URL thay đổi (Ví dụ click từ Home vào danh mục)
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategories = [params['categoryId']];
      }
      this.filterProducts();
    });
  }

  // Hàm giả lập Lọc & Sắp xếp (Sau này Logic này nằm ở Backend)
  filterProducts() {
    this.isLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      let result = [...this.allProducts];

      // 1. Filter by Category
      if (this.selectedCategories.length > 0) {
        result = result.filter(p => this.selectedCategories.includes(p.categoryId));
      }

      // 2. Filter by Price
      result = result.filter(p => p.price >= this.priceRange[0] && p.price <= this.priceRange[1]);

      // 3. Sort
      if (this.selectedSort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (this.selectedSort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
      }
      // 'newest' giả định mặc định là thứ tự mảng

      this.totalRecords = result.length;
      
      // 4. Pagination (Cắt mảng)
      const start = this.first;
      const end = this.first + this.rows;
      this.products = result.slice(start, end);

      this.isLoading = false;
    }, 500);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.filterProducts();
    // Scroll lên đầu trang cho mượt
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Reset bộ lọc
  clearFilters() {
    this.selectedCategories = [];
    this.priceRange = [0, 1000000];
    this.filterProducts();
  }

  // Helper hiển thị trạng thái kho (Copy từ Home)
  getInventoryStatus(product: Product) {
    if (product.quantity === 0) return { label: 'Hết hàng', severity: 'danger' as const }; // ép kiểu as const để strict type
    else if (product.quantity < 5) return { label: 'Sắp hết', severity: 'warning' as const };
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}