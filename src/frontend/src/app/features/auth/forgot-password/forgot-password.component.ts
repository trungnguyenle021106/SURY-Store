import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; // Thêm ActivatedRoute
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
export class ForgotPasswordComponent implements OnInit {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute); // Inject Route để đọc URL
  messageService = inject(MessageService);

  // step 1: Form nhập email, step 2: Form nhập pass mới
  currentStep = 1;
  isLoading = false;
  isEmailSent = false; // Biến mới để hiện thông báo "Đã gửi mail"

  // Dữ liệu lấy từ URL
  tokenFromUrl = '';
  emailFromUrl = '';

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

  ngOnInit(): void {
    // Kiểm tra URL xem có phải User đến từ Email không?
    // Link: /auth/reset-password?email=...&token=...
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];

      if (token && email) {
        // Nếu có token -> Chuyển ngay sang bước 2 (Nhập pass mới)
        this.currentStep = 2;
        this.tokenFromUrl = token;
        this.emailFromUrl = email;
      } else {
        // Nếu không có -> Ở lại bước 1 (Yêu cầu quên pass)
        this.currentStep = 1;
      }
    });
  }

  // Xử lý Bước 1: Yêu cầu quên mật khẩu
  onForgotSubmit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    const email = this.forgotForm.value.email;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isEmailSent = true; // Hiện thông báo thành công, ẩn form đi
        this.messageService.add({ severity: 'success', summary: 'Đã gửi email', detail: 'Vui lòng kiểm tra hộp thư của bạn.' });
      },
      error: (err) => {
        this.isLoading = false;
        // Backend ném lỗi 400 nếu email ko tồn tại hoặc đang cooldown 5p
        const msg = err.error?.detail || err.error?.message || 'Có lỗi xảy ra.';
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: msg });
      }
    });
  }

  // Xử lý Bước 2: Đổi mật khẩu (dùng token từ URL)
  onResetSubmit() {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const payload = {
      email: this.emailFromUrl, // Lấy từ URL
      verifyToken: this.tokenFromUrl, // Lấy từ URL
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đổi mật khẩu thành công!' });
          // Chuyển về login sau 2s
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        }
      },
      error: (err) => {
        this.isLoading = false;
        let msg = err.error?.detail || err.error?.message || '';

        const msgLower = msg.toLowerCase();

        if (msgLower.includes('invalid token')) {
          msg = 'Token không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu.';
        }
        else if (!msg) {
          msg = 'Đã xảy ra lỗi không xác định.';
        }
        this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: msg });
      }
    });
  }
}