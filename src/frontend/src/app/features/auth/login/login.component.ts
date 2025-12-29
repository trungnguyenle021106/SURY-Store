import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  isLoading = signal(false);
  
  loginForm = this.fb.group({
    email: ['demo@test.com', [Validators.required, Validators.email]],
    password: ['123456', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        alert('Đăng nhập thất bại (Server có thể chưa chạy)');
      }
    });
  }
}
