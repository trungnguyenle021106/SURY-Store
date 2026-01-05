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
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, DialogModule, ToastModule, TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent implements OnInit {
  categoryService = inject(CategoryService);
  messageService = inject(MessageService);
  fb = inject(FormBuilder);

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
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  // 1. Load danh sách (Gọi khi init hoặc chuyển trang)
  loadCategories(event?: any) {
    this.isLoading = true;
    
    // Nếu gọi từ Table (khi bấm chuyển trang)
    if (event) {
      this.currentPage = (event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }

    this.categoryService.getCategories(this.currentPage, this.pageSize, this.keyword)
      .subscribe({
        next: (res) => {
          this.categories = res.data;
          this.totalRecords = res.count;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tải được dữ liệu' });
        }
      });
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

  // 4. Lưu (Tạo hoặc Update)
  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = { name: this.categoryForm.value.name };

    // Chọn API dựa vào chế độ Edit hay New
    const request$ = this.isEditMode && this.currentId
      ? this.categoryService.updateCategory(this.currentId, payload)
      : this.categoryService.createCategory(payload) as Observable<any>;

    request$.subscribe({
      next: (res) => {
        this.isSaving = false;
        this.displayDialog = false; // Đóng modal
        
        // Thông báo & Reload
        const msg = this.isEditMode ? 'Cập nhật thành công' : 'Tạo mới thành công';
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: msg });
        this.loadCategories(); // Tải lại bảng
      },
      error: () => {
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra' });
      }
    });
  }
}