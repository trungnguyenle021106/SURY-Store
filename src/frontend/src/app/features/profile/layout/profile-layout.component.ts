import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service'; // Import UserService

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './profile-layout.component.html',
})
export class ProfileLayoutComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);

  // Biến lưu Avatar thật (nếu có)
  avatarUrl = signal<string | undefined>(undefined);

  ngOnInit() {
    // Gọi API lấy thông tin chi tiết (để lấy AvatarUrl mà AuthUserInfo không có)
    this.userService.getMe().subscribe({
      next: (profile) => {
        if (profile.avatarUrl) {
          this.avatarUrl.set(profile.avatarUrl);
        }
      },
      error: () => console.log('Không tải được chi tiết profile')
    });
  }

  // Getter: Lấy chữ cái đầu của tên
  get userInitial(): string {
    const user = this.authService.currentUser();
    // Model của bạn chỉ có fullName, không có userName
    const name = user?.fullName || user?.email || 'U'; 
    return name.charAt(0).toUpperCase();
  }

  // Getter: Lấy tên hiển thị
  get displayName(): string {
    const user = this.authService.currentUser();
    return user?.fullName || 'Khách hàng';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onLogout() {
    this.authService.logout().subscribe();
  }
}