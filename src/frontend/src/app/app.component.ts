import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  templateUrl: `./app.component.html`,
  styleUrl: './app.component.scss',
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.authService.fetchUserInfo().subscribe();
    this.route.queryParams.subscribe(params => {
      const status = params['verifyStatus'];

      if (status === 'success') {
        // Delay nhẹ 1 chút để giao diện render xong mới hiện toast
        setTimeout(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập.',
            life: 5000
          });
        }, 500); // 0.5 giây
      }
      else if (status === 'failed') {
        setTimeout(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Link xác thực không hợp lệ hoặc đã hết hạn.',
            life: 5000
          });
        }, 500);
      }

      // Xóa params trên URL cho sạch (Sau khi đã hiện thông báo)
      if (status) {
        this.router.navigate([], {
          queryParams: { 'verifyStatus': null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  title = 'Tini Fashion Store';
}