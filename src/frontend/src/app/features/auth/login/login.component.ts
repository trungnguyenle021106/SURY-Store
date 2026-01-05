import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    InputTextModule, PasswordModule, ButtonModule, CheckboxModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  messageService = inject(MessageService);
  userService = inject(AuthService); 
  
  loginForm: FormGroup;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.checkUserRoleAndRedirect();
      },
      error: (err) => {
        this.isLoading = false;

        const errorMsg = err.error?.message || 'Email hoặc mật khẩu không đúng.';
        this.messageService.add({ severity: 'error', summary: 'Đăng nhập thất bại', detail: errorMsg });
      }
    });
  }

  checkUserRoleAndRedirect() {
    this.userService.getTokenInfo().subscribe(user => {
      if (user.roles.includes('Admin')) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/']); // Về trang chủ khách hàng
      }
    });
  }
}