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
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    InputTextModule, PasswordModule, ButtonModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  messageService = inject(MessageService);

  currentStep = 1;
  isLoading = false;
  savedEmail = '';
  savedToken = '';

  forgotForm: FormGroup;
  resetForm: FormGroup;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Xử lý Bước 1: Gửi Email lấy Token
  onForgotSubmit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    const email = this.forgotForm.value.email;

    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.savedEmail = email;
        this.savedToken = res.verifyToken; // Lưu token nhận được
        
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xác thực email.' });
        
        // Chuyển sang bước 2
        this.currentStep = 2;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Email không tồn tại.' });
      }
    });
  }

  // Xử lý Bước 2: Gửi Token + Pass mới để Reset
  onResetSubmit() {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const payload = {
      email: this.savedEmail,
      verifyToken: this.savedToken, // Tự động điền token từ bước 1
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Mật khẩu đã được đổi. Vui lòng đăng nhập.' });
            setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: 'Không thể đổi mật khẩu.' });
      }
    });
  }
}