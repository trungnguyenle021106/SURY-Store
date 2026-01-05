import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// PrimeNG
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Service
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  messageService = inject(MessageService);

  passwordForm: FormGroup;
  isLoading = false;

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Validator kiểm tra 2 mật khẩu trùng nhau
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
        this.passwordForm.markAllAsTouched();
        return;
    }

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
        next: (res) => {
            this.isLoading = false;
            if (res.isSuccess) {
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đổi mật khẩu thành công.' });
                this.passwordForm.reset();
            }
        },
        error: (err) => {
            this.isLoading = false;
            this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: 'Mật khẩu cũ không đúng hoặc lỗi hệ thống.' });
        }
    });
  }
}