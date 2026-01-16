import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services & Models
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UpdateProfileRequest } from '../../../core/models/user.models';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './profile-info.component.html'
})
export class ProfileInfoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  infoForm: FormGroup;
  isLoading = false;
  emailDisplay: string = ''; // Chỉ để hiển thị, không sửa được
  currentAvatarUrl?: string; // Lưu lại avatar cũ nếu không đổi

  constructor() {
    // Khởi tạo form với validate bắt buộc nhập tên
    this.infoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.userService.getMe().subscribe({
      next: (profile) => {
        // console.log('User Profile:', profile);
        // 1. Hiển thị email (readonly)
        this.emailDisplay = profile.email;
        this.currentAvatarUrl = profile.avatarUrl;

        // 2. Fill tên vào form
        this.infoForm.patchValue({
          fullName: profile.fullName
        });
        
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải thông tin hồ sơ' });
        this.isLoading = false;
      }
    });
  }

  onSave() {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched(); // Hiện lỗi đỏ nếu chưa nhập
      return;
    }

    this.isLoading = true;

    // Chuẩn bị payload gửi đi
    const payload: UpdateProfileRequest = {
      fullName: this.infoForm.value.fullName,
      avatarUrl: this.currentAvatarUrl // Giữ nguyên avatar cũ (vì form này chưa có chỗ upload ảnh)
    };

    this.userService.updateProfile(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật hồ sơ!' });
        
        // [QUAN TRỌNG]: Gọi AuthService load lại info mới để Header và Sidebar cập nhật tên ngay lập tức
        this.authService.fetchUserInfo().subscribe();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Cập nhật thất bại. Vui lòng thử lại.' });
        this.isLoading = false;
      }
    });
  }
}