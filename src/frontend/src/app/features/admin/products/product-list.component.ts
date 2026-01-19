import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

// PrimeNG Imports
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
  selectedCategoryId: string | null = null;
  
  // [CẬP NHẬT] Biến filter trạng thái
  selectedStatus: number | null = null;
  
  // [CẬP NHẬT] Mảng options status lấy đúng theo file Utils của bạn
  statusOptions = [
      { label: ProductStatusLabel[ProductStatus.Active], value: ProductStatus.Active },       // Đang bán
      { label: ProductStatusLabel[ProductStatus.OutOfStock], value: ProductStatus.OutOfStock }, // Hết hàng
      { label: ProductStatusLabel[ProductStatus.Discontinued], value: ProductStatus.Discontinued }, // Ngừng bán
      { label: ProductStatusLabel[ProductStatus.Draft], value: ProductStatus.Draft }          // Nháp
  ];

  isLastPage = false;

  // --- UTILS ---
  ProductStatus = ProductStatus;
  getStatusLabel = (s: number) => ProductStatusLabel[s];
  getStatusSeverity = (s: number) => ProductStatusSeverity[s];

  // --- PRODUCT DIALOG ---
  displayDialog = false;
  isEditMode = false;
  currentId: string | null = null;
  isSaving = false;
  productForm: FormGroup;

  // --- STOCK DIALOG ---
  displayStockDialog = false;
  stockProduct: Product | null = null;
  stockForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      imageUrl: [''],
      categoryId: [null, Validators.required],
      quantity: [{ value: 0, disabled: true }]
    });

    this.stockForm = this.fb.group({
      action: ['add', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategoriesForDropdown();
  }

  loadCategoriesForDropdown() {
    this.categoryService.getCategories(1, 100).subscribe((res: any) => {
      this.categories = res.categories ? res.categories.data : [];
      this.loadProducts();
    });
  }

  loadProducts(event?: any, isForceRefresh: boolean = false, isAppend: boolean = false) {
    if (this.isLoading) return;

    this.isLoading = true;

    if (!isAppend) {
      this.currentPage = 1;
      this.products = [];
      this.isLastPage = false;
    }

    // [QUAN TRỌNG] Truyền this.selectedStatus vào API
    this.productService.getProducts(
      this.currentPage,
      this.pageSize,
      this.keyword,
      this.selectedCategoryId || undefined,
      undefined, 
      true, // Mặc định includeDrafts = true để nếu lọc status=Draft thì vẫn hiện
      isForceRefresh,
      this.selectedStatus !== null ? this.selectedStatus : undefined 
    ).subscribe({
      next: (res: any) => {
        const newProducts = res.products.data;

        if (isAppend) {
          this.products = [...this.products, ...newProducts];
        } else {
          this.products = newProducts;
        }

        this.totalRecords = res.products.count;

        if (this.products.length >= this.totalRecords || newProducts.length === 0) {
          this.isLastPage = true;
        }

        this.isLoading = false;

        if (isForceRefresh) {
          this.messageService.add({ severity: 'success', summary: 'Đã làm mới', detail: 'Dữ liệu cập nhật' });
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onScroll(event: any) {
    if (this.isLoading || this.isLastPage) return;

    const element = event.target;
    if (element.offsetHeight + element.scrollTop >= element.scrollHeight - 50) {
      this.currentPage++;
      this.loadProducts(null, false, true);
    }
  }

  refreshData() {
    this.loadProducts(null, true, false);
  }

  getCategoryName(id: string): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '---';
  }

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
        this.loadProducts();
      },
      error: () => {
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lưu sản phẩm' });
      }
    });
  }

  openStockDialog(product: Product) {
    this.stockProduct = product;
    this.stockForm.reset({ action: 'add', quantity: 10 });
    this.displayStockDialog = true;
  }

  saveStock() {
    if (this.stockForm.invalid || !this.stockProduct) return;

    this.isSaving = true;
    const { action, quantity } = this.stockForm.value;
    const productId = this.stockProduct.id;
    const payload = { quantity: quantity };

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
        this.loadProducts();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật kho' });
      }
    });
  }

  toggleStatus(product: Product) {
    const isCurrentlyActive = product.status === ProductStatus.Active;
    const actionLabel = isCurrentlyActive ? 'ngừng bán' : 'mở bán lại'; // Update theo từ ngữ trong Utils

    this.confirmationService.confirm({
      message: `Bạn có chắc muốn ${actionLabel} sản phẩm "${product.name}"?`,
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