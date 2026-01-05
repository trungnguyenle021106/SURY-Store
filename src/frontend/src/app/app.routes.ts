import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';


export const routes: Routes = [
  // 1. LAYOUT KHÁCH HÀNG (Có Header/Footer hồng)
  {
    path: '',
    component: MainLayoutComponent, 
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'catalog', loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES) },
      { path: 'basket', loadComponent: () => import('./features/basket/basket.component').then(m => m.BasketComponent) },
      { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'order-success', loadComponent: () => import('./features/order-success/order-success.component').then(m => m.OrderSuccessComponent) },
      { path: 'profile', loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES) },
    ]
  },

  // 2. LAYOUT AUTH (Login/Register - Không có Header/Footer)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // 3. LAYOUT ADMIN (Giao diện riêng - Sidebar đen)
  // LƯU Ý: Phải nằm NGANG HÀNG với MainLayoutComponent ở trên, KHÔNG được nằm trong children của nó.
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // 4. TRANG 404 (Luôn nằm cuối cùng)
  { 
    path: '**', 
    loadComponent: () => import('./core/layout/not-found/not-found.component').then(m => m.NotFoundComponent) 
  }
];