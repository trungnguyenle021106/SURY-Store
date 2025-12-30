import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { SidebarModule } from 'primeng/sidebar'; // Hoặc DrawerModule tùy phiên bản PrimeNG

@Component({
  selector: 'app-header',
 imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive,
    ButtonModule,
    InputTextModule,
    BadgeModule,
    SidebarModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
sidebarVisible: boolean = false;

  navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/catalog' },
  ];
}
