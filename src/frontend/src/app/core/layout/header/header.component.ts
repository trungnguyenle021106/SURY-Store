import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Thêm Router
import { FormsModule } from '@angular/forms'; // Thêm FormsModule

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { SidebarModule } from 'primeng/sidebar';
import { BasketService } from '../../services/basket.service';
import { AuthService } from '../../services/auth.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule, // Nhớ import vào đây
    ButtonModule,
    InputTextModule,
    BadgeModule,
    SidebarModule,
    TooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  basketService = inject(BasketService);
  authService = inject(AuthService);
  private router = inject(Router); // Inject Router
  
  sidebarVisible: boolean = false;
  keyword: string = ''; // Biến lưu từ khóa

  navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/catalog' },
  ];

  // Hàm xử lý tìm kiếm
  onSearch() {
    if (this.keyword.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { keyword: this.keyword } });
      // Reset sidebar nếu đang mở trên mobile
      this.sidebarVisible = false;
    }
  }
}