import { Component, inject } from '@angular/core'; // Bỏ OnInit
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Bỏ ActivatedRoute
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
  // Không cần inject ActivatedRoute nữa

  loginForm: FormGroup;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // --- ĐÃ XÓA ngOnInit ---
  // Việc bắt URL ?verifyStatus=... giờ là việc của AppComponent lo.

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
        
        // Vẫn giữ logic hiển thị lỗi khi User bấm nút Đăng nhập mà bị lỗi
        const errorMsg = err.error?.detail || err.error?.message || 'Email hoặc mật khẩu không đúng.';
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Đăng nhập thất bại', 
          detail: errorMsg 
        });
      }
    });
  }

  checkUserRoleAndRedirect() {
    this.authService.getTokenInfo().subscribe(user => {
      if (user.roles.includes('Admin')) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/']); 
      }
    });
  }
}