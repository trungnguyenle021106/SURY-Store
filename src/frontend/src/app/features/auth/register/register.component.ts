import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    InputTextModule, PasswordModule, ButtonModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  messageService = inject(MessageService);

  registerForm: FormGroup;
  isLoading = false;
  isSuccess = false; // <--- THÊM BIẾN NÀY ĐỂ CHECK TRẠNG THÁI

  constructor() {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true; // <--- BẬT CỜ SUCCESS, KHÔNG REDIRECT NỮA
      },
      error: (err) => {
        this.isLoading = false;
        
        // Lấy message lỗi từ Backend (ví dụ lỗi Spam block 24h hoặc Email duplicate)
        // Cấu trúc lỗi tùy thuộc vào GlobalExceptionHandler của bạn trả về (thường là err.error.detail hoặc err.error)
        const errorMessage = err.error?.detail || err.error || 'Có lỗi xảy ra, vui lòng thử lại.';
        
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Đăng ký thất bại', 
          detail: errorMessage,
          life: 5000 // Hiện lâu hơn chút để user đọc kịp lỗi
        });
      }
    });
  }
}