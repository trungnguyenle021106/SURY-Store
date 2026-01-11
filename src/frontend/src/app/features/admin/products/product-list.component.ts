import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';

// Services & Models
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category, ProductStatus } from '../../../core/models/catalog.models';
import { ProductStatusLabel, ProductStatusSeverity } from '../../../shared/utils/product-status.util';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, InputTextarea, InputNumberModule,
    DropdownModule, DialogModule, ToastModule, TagModule, ImageModule, ConfirmDialogModule, 
    TooltipModule, RadioButtonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  fb = inject(FormBuilder);

  // --- DATA ---
  products: Product[] = [];
  categories: Category[] = []; 
  totalRecords = 0;
  isLoading = false;

  // --- FILTERS & PAGINATION ---
  currentPage = 1;
  pageSize = 10;
  keyword = '';
  selectedCategoryId: string | null = null; // Thêm biến để lọc category

  // --- UTILS ---
  ProductStatus = ProductStatus;
  getStatusLabel = (s: number) => ProductStatusLabel[s];
  getStatusSeverity = (s: number) => ProductStatusSeverity[s];

  // --- PRODUCT DIALOG (Create/Edit) ---
  displayDialog = false;
  isEditMode = false;
  currentId: string | null = null;
  isSaving = false;
  productForm: FormGroup;

  // --- STOCK DIALOG (Manage Quantity) ---
  displayStockDialog = false;
  stockProduct: Product | null = null;
  stockForm: FormGroup;

  constructor() {
    // Form chính sản phẩm
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      imageUrl: [''],
      categoryId: [null, Validators.required],
      quantity: [{ value: 0, disabled: true }] // Chỉ hiển thị, không sửa ở đây
    });

    // Form quản lý kho
    this.stockForm = this.fb.group({
      action: ['add', Validators.required], // 'add' hoặc 'remove'
      quantity: [1, [Validators.required, Validators.min(1)]],
      note: [''] // Ghi chú nhập/xuất (nếu cần mở rộng sau này)
    });
  }

  ngOnInit(): void {
    // Load categories trước để map tên, sau đó mới load products
    this.loadCategoriesForDropdown(); 
  }

  // 1. Load Categories
  loadCategoriesForDropdown() {
    this.categoryService.getCategories(1, 100).subscribe((res: any) => {
      // Handle cấu trúc response tùy biến của bạn
      this.categories = res.categories ? res.categories.data : [];
      
      // Sau khi có categories thì mới load products để map tên
      this.loadProducts();
    });
  }

  // 2. Load Products
 loadProducts(event?: any, isForceRefresh: boolean = false) {
    this.isLoading = true;
    if (event) {
      this.currentPage = (event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }

    // Gọi Service: Truyền thêm tham số thứ 7 là isForceRefresh
    this.productService.getProducts(
        this.currentPage, 
        this.pageSize, 
        this.keyword, 
        this.selectedCategoryId || undefined, 
        undefined, 
        true,          // includeDrafts (Admin luôn cần xem nháp)
        isForceRefresh // <--- Tham số bypassCache mới
    )
      .subscribe({
        next: (res: any) => {
          this.products = res.products.data;
          this.totalRecords = res.products.count;
          this.isLoading = false;

          // Nếu là force refresh thì hiển thị thông báo cho admin biết
          if (isForceRefresh) {
             this.messageService.add({ severity: 'success', summary: 'Đã làm mới', detail: 'Dữ liệu đã được cập nhật trực tiếp từ Database' });
          }
        },
        error: () => {
          this.isLoading = false;
          this.products = [];
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu' });
        }
      });
  }

  // 2. THÊM HÀM refreshData (Gắn vào nút bấm)
  refreshData() {
    // Gọi loadProducts với tham số true để ép bỏ qua cache
    this.loadProducts(null, true);
  }

  // Helper: Lấy tên danh mục từ ID
  getCategoryName(id: string): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '---';
  }

  // --- CRUD PRODUCT ---

  openNew() {
    this.isEditMode = false;
    this.currentId = null;
    this.productForm.reset({ price: 0, quantity: 0 });
    this.displayDialog = true;
  }

  editProduct(product: Product) {
    this.isEditMode = true;
    this.currentId = product.id;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      quantity: product.quantity 
    });
    this.displayDialog = true;
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formVal = this.productForm.value;

    const payload = {
      name: formVal.name,
      price: formVal.price,
      description: formVal.description || '',
      imageUrl: formVal.imageUrl || '',
      categoryId: formVal.categoryId
    };

    let request$: Observable<any>;
    if (this.isEditMode && this.currentId) {
      request$ = this.productService.updateProduct(this.currentId, payload);
    } else {
      request$ = this.productService.createProduct(payload);
    }

    request$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã lưu sản phẩm' });
        this.displayDialog = false;
        this.isSaving = false;
        this.loadProducts(); // Reload table
      },
      error: () => {
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lưu sản phẩm' });
      }
    });
  }

  // --- STOCK MANAGEMENT (NEW FEATURE) ---

  openStockDialog(product: Product) {
    this.stockProduct = product;
    this.stockForm.reset({ action: 'add', quantity: 10 }); // Default nhập 10 cái
    this.displayStockDialog = true;
  }

  saveStock() {
    if (this.stockForm.invalid || !this.stockProduct) return;

    this.isSaving = true;
    const { action, quantity } = this.stockForm.value;
    const productId = this.stockProduct.id;
    const payload = { quantity: quantity };

    // Chọn API dựa trên Action
    const request$ = action === 'add' 
      ? this.productService.addStock(productId, payload)
      : this.productService.removeStock(productId, payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Thành công', 
            detail: action === 'add' ? `Đã nhập thêm ${quantity} sản phẩm` : `Đã giảm ${quantity} sản phẩm`
        });
        this.displayStockDialog = false;
        this.isSaving = false;
        this.loadProducts(); // Reload để cập nhật số lượng và trạng thái (OutOfStock -> Active)
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật kho' });
      }
    });
  }

  // --- CHANGE STATUS ---

  toggleStatus(product: Product) {
    const isCurrentlyActive = product.status === ProductStatus.Active;
    // Nếu đang là OutOfStock, cũng coi như cần active lại (nhưng thực tế nên nhập kho)
    // Logic ở đây: Nếu Active -> Discontinue. Nếu Anything else -> Active.
    
    const actionLabel = isCurrentlyActive ? 'Ngừng kinh doanh' : 'Mở bán lại';
    const actionVerb = isCurrentlyActive ? 'ngừng kinh doanh' : 'mở bán lại';

    this.confirmationService.confirm({
      message: `Bạn có chắc muốn ${actionVerb} sản phẩm "${product.name}"?`,
      header: 'Xác nhận trạng thái',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Đồng ý',
      acceptButtonStyleClass: isCurrentlyActive ? 'p-button-danger' : 'p-button-success',
      rejectLabel: 'Hủy',
      accept: () => {
        const req$ = isCurrentlyActive
          ? this.productService.discontinueProduct(product.id)
          : this.productService.activateProduct(product.id);

        req$.subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Cập nhật', detail: 'Đã thay đổi trạng thái' });
            this.loadProducts();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra' })
        });
      }
    });
  }
}