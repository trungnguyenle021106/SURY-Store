import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { SidebarModule } from 'primeng/sidebar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
// BỎ: import { PaginatorModule } from 'primeng/paginator'; -> Không dùng nữa

// Data & Models
import { Category, Product } from '../../core/models/catalog.models';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    ButtonModule, DropdownModule, SliderModule, CheckboxModule,
    SidebarModule, TagModule, TooltipModule, SkeletonModule
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

  // --- DATA ---
  rawProducts: Product[] = [];        // Dữ liệu gốc từ API
  allFilteredProducts: Product[] = []; // Dữ liệu sau khi lọc (Category, Price, Sort)
  displayProducts: Product[] = [];     // Dữ liệu đang hiển thị trên màn hình (được cắt ra từ allFilteredProducts)
  
  categories: Category[] = [];

  // --- FILTER STATES ---
  selectedCategories: string[] = [];
  priceRange: number[] = [0, 1000000];
  keyword: string = '';
  sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá: Thấp đến Cao', value: 'price_asc' },
    { label: 'Giá: Cao đến Thấp', value: 'price_desc' }
  ];
  selectedSort: string = 'newest';

  // --- UI STATES ---
  isLoadingInit = true;      // Loading lần đầu vào trang
  isLoadingMore = false;     // Loading khi cuộn xuống dưới
  isLoadingCategories = true;
  mobileFilterVisible = false;
  
  // --- INFINITE SCROLL CONFIG ---
  itemsPerBatch = 12; // Số lượng load thêm mỗi lần cuộn
  currentIndex = 0;   // Vị trí cắt hiện tại

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      if (params['categoryId']) {
        this.selectedCategories = [params['categoryId']];
      }
      this.loadDataFromApi(this.keyword);
    });
  }

  // 1. Tải dữ liệu gốc từ API
  loadDataFromApi(searchKeyword: string = '') {
    this.isLoadingInit = true;
    // Giả sử lấy 100 sản phẩm để lọc client-side
    this.productService.getProducts(1, 100, searchKeyword)
      .pipe(finalize(() => {
         // Loading tắt ở filterProducts
      }))
      .subscribe({
        next: (response: any) => {
          // Xử lý response tùy cấu trúc API của bạn
          const data = response.products?.data || response.data || [];
          this.rawProducts = Array.isArray(data) ? data : [];
          
          // Sau khi có dữ liệu, chạy bộ lọc ngay
          this.applyFilters();
        },
        error: (err) => {
          console.error(err);
          this.rawProducts = [];
          this.isLoadingInit = false;
        }
      });
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.categoryService.getCategories(1, 100)
      .pipe(finalize(() => this.isLoadingCategories = false))
      .subscribe({
        next: (res: any) => this.categories = res.categories?.data || res.data || [],
        error: (err) => console.error(err)
      });
  }

  // 2. Logic Lọc & Sắp xếp (Core Logic)
  applyFilters() {
    this.isLoadingInit = true;

    // Giả lập delay nhỏ để UI mượt hơn
    setTimeout(() => {
      let result = [...this.rawProducts];

      // Filter Category
      if (this.selectedCategories.length > 0) {
        result = result.filter(p => this.selectedCategories.includes(p.categoryId));
      }

      // Filter Price
      result = result.filter(p => p.price >= this.priceRange[0] && p.price <= this.priceRange[1]);

      // Sort
      if (this.selectedSort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (this.selectedSort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
      }

      // Cập nhật mảng kết quả lọc
      this.allFilteredProducts = result;
      
      // Reset Scroll: Hiển thị batch đầu tiên
      this.resetScroll();
      
      this.isLoadingInit = false;
    }, 300);
  }

  // 3. Reset trạng thái hiển thị (khi đổi bộ lọc)
  resetScroll() {
    this.currentIndex = 0;
    this.displayProducts = [];
    this.appendItems(); // Load batch đầu tiên
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu
  }

  // 4. Cắt dữ liệu từ mảng lọc bỏ vào mảng hiển thị
  appendItems() {
    if (this.currentIndex >= this.allFilteredProducts.length) return;

    const nextIndex = this.currentIndex + this.itemsPerBatch;
    const batch = this.allFilteredProducts.slice(this.currentIndex, nextIndex);
    
    this.displayProducts = [...this.displayProducts, ...batch];
    this.currentIndex = nextIndex;
  }

  // 5. Bắt sự kiện cuộn trang (Window Scroll)
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Nếu đang loading hoặc đã hiển thị hết thì dừng
    if (this.isLoadingInit || this.isLoadingMore || this.displayProducts.length >= this.allFilteredProducts.length) {
      return;
    }

    // Tính toán vị trí cuộn: (Chiều cao nội dung - Chiều cao màn hình)
    // Nếu cuộn gần tới đáy (còn 200px)
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
      this.isLoadingMore = true;
      
      // Giả lập delay loading thêm (để hiện skeleton cho đẹp)
      setTimeout(() => {
        this.appendItems();
        this.isLoadingMore = false;
      }, 500);
    }
  }

  clearFilters() {
    this.selectedCategories = [];
    this.priceRange = [0, 1000000];
    this.applyFilters();
  }

  getInventoryStatus(product: Product) {
    if (product.quantity === 0) return { label: 'Hết hàng', severity: 'danger' as const };
    else if (product.quantity < 5) return { label: 'Sắp hết', severity: 'warning' as const };
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}