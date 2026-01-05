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

// Services & Models
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category, ProductStatus } from '../../../core/models/catalog.models';
import { ProductStatusLabel, ProductStatusSeverity } from '../../../shared/utils/product-status.util';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, ButtonModule, InputTextModule, InputTextarea, InputNumberModule, FormsModule,
    DropdownModule, DialogModule, ToastModule, TagModule, ImageModule, ConfirmDialogModule, TooltipModule
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

  // Data
  products: Product[] = [];
  categories: Category[] = []; // Để đổ vào Dropdown
  totalRecords = 0;
  isLoading = false;

  // Pagination Params
  currentPage = 1;
  pageSize = 10;
  keyword = '';

  // Utils (Dùng trong HTML)
  ProductStatus = ProductStatus;
  getStatusLabel = (s: number) => ProductStatusLabel[s];
  getStatusSeverity = (s: number) => ProductStatusSeverity[s];

  // Dialog State
  displayDialog = false;
  isEditMode = false;
  currentId: string | null = null;
  isSaving = false;

  // Form
  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      imageUrl: [''],
      categoryId: [null, Validators.required],
      // Vẫn giữ field này để hiển thị khi Sửa (Edit), nhưng không bắt buộc nhập
      quantity: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategoriesForDropdown();
  }

  // 1. Load Categories (Lấy hết hoặc trang lớn để fill dropdown)
  loadCategoriesForDropdown() {
    this.categoryService.getCategories(1, 100).subscribe(res => {
      this.categories = res.data;
    });
  }

  // 2. Load Products
  loadProducts(event?: any) {
    this.isLoading = true;
    if (event) {
      this.currentPage = (event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }

    this.productService.getProducts(this.currentPage, this.pageSize, this.keyword)
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.totalRecords = res.count;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          // Mock data test UI if fail
          this.products = [];
        }
      });
  }

  // 3. Open Create Dialog
  openNew() {
    this.isEditMode = false;
    this.currentId = null;
    this.productForm.reset({ price: 0 });
    this.displayDialog = true;
  }

  // 4. Open Edit Dialog
  editProduct(product: Product) {
    this.isEditMode = true;
    this.currentId = product.id;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      quantity: product.quantity // Thường edit không cho sửa số lượng trực tiếp ở đây, nhưng tạm để
    });
    this.displayDialog = true;
  }

  // 5. Save (Create / Update)
 saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formVal = this.productForm.value;
    
    // Payload chuẩn (Không có quantity)
    const payload = {
      name: formVal.name,
      price: formVal.price,
      description: formVal.description || '',
      imageUrl: formVal.imageUrl || '',
      categoryId: formVal.categoryId
    };

    let request$ : Observable<any>;
    if (this.isEditMode && this.currentId) {
      request$ = this.productService.updateProduct(this.currentId, payload);
    } else {
      // Create: Backend tự set quantity default
      request$ = this.productService.createProduct(payload); 
    }

    request$.subscribe({
      next: (res) => {
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

  // 6. Đổi trạng thái (Active / Discontinue)
  toggleStatus(product: Product) {
    const isCurrentlyActive = product.status === ProductStatus.Active;
    const action = isCurrentlyActive ? 'ngừng kinh doanh' : 'mở bán lại';

    this.confirmationService.confirm({
      message: `Bạn có chắc muốn ${action} sản phẩm "${product.name}"?`,
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