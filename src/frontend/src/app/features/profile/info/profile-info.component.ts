import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './profile-info.component.html',
})
export class ProfileInfoComponent implements OnInit {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  messageService = inject(MessageService);

  infoForm: FormGroup;
  isLoading = false;
  emailDisplay = '';

  constructor() {
    this.infoForm = this.fb.group({
      fullName: ['', Validators.required],
      // avatarUrl: [''] // Nếu có làm upload ảnh thì thêm vào
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.emailDisplay = user.email;
        this.infoForm.patchValue({
          fullName: user.fullName
        });
      },
      error: () => {
        // Handle lỗi nếu chưa login
      }
    });
  }

  onSave() {
    if (this.infoForm.invalid) return;

    this.isLoading = true;
    const payload = {
      fullName: this.infoForm.value.fullName
      // avatarUrl: ...
    };

    this.userService.updateProfile(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật hồ sơ thành công!' });
        }
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi lưu.' });
      }
    });
  }
}