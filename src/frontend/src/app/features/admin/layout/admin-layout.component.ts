import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { DrawerModule } from 'primeng/drawer'; // <--- MỚI: Import cái này
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    ButtonModule, 
    AvatarModule, 
    MenuModule,
    DrawerModule // <--- MỚI: Khai báo vào đây
  ],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  
  // Biến điều khiển menu mobile
  sidebarVisible: boolean = false; 

  logout() {
    this.authService.logout().subscribe();
  }
}