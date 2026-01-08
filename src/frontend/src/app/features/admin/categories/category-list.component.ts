import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

// Service & Model
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/catalog.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, DialogModule, ToastModule, TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  // Data
  categories: Category[] = [];
  totalRecords = 0;
  isLoading = false;

  // Pagination Params
  currentPage = 1;
  pageSize = 10;
  keyword = '';

  // Dialog State
  displayDialog = false;
  isEditMode = false;
  currentId: string | null = null;
  isSaving = false;

  // Form
  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]] // Validate tên ít nhất 2 ký tự
    });
  }

  ngOnInit(): void {
    // Để Table tự gọi loadCategories thông qua event (onLazyLoad)
  }

  // 1. Load danh sách
  loadCategories(event?: any) {
    this.isLoading = true;

    if (event) {
      this.currentPage = (event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }

    this.categoryService.getCategories(this.currentPage, this.pageSize, this.keyword)
      .subscribe({
        next: (res: any) => { // Dùng any để chấp nhận cấu trúc res.categories
          // GIỮ NGUYÊN THEO Ý BẠN:
          if (res.categories) {
            this.categories = res.categories.data;
            this.totalRecords = res.categories.count;
          } else {
             // Fallback nếu API thay đổi sau này
             this.categories = [];
             this.totalRecords = 0;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tải được dữ liệu' });
        }
      });
  }
  
  // Helper search
  onSearch() {
    this.currentPage = 1;
    // Gọi loadCategories với giả lập event để reset về trang 1
    this.loadCategories({ first: 0, rows: this.pageSize });
  }

  // 2. Mở dialog Thêm mới
  openNew() {
    this.isEditMode = false;
    this.currentId = null;
    this.categoryForm.reset();
    this.displayDialog = true;
  }

  // 3. Mở dialog Sửa
  editCategory(cat: Category) {
    this.isEditMode = true;
    this.currentId = cat.id;
    this.categoryForm.patchValue({ name: cat.name });
    this.displayDialog = true;
  }

  // 4. Lưu
  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = { name: this.categoryForm.value.name };

    const request$ = this.isEditMode && this.currentId
      ? this.categoryService.updateCategory(this.currentId, payload)
      : this.categoryService.createCategory(payload) as Observable<any>;

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.displayDialog = false;
        const msg = this.isEditMode ? 'Cập nhật thành công' : 'Tạo mới thành công';
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: msg });
        
        // Reload giữ nguyên trang hiện tại
        this.loadCategories({ first: (this.currentPage - 1) * this.pageSize, rows: this.pageSize });
      },
      error: () => {
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra' });
      }
    });
  }
}