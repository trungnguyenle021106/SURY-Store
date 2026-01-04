import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Layout chính cho người dùng (Customer)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) 
        // Nếu chưa có home, có thể redirect về catalog
      },
      { 
        path: 'catalog', 
        loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES) 
      },
    //   { 
    //     path: 'basket', 
    //     loadComponent: () => import('./features/basket/basket.component').then(m => m.BasketComponent) 
    //   },
      // Các routes khác: profile, orders, checkout...
    ]
  },
  
  // Layout cho Auth (Đăng nhập/Đăng ký thường không có Header/Footer đầy đủ)
//   {
//     path: 'auth',
//     loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
//   },

//   // Layout cho Admin (Sẽ dùng layout khác, ví dụ: AdminLayoutComponent)
//   {
//     path: 'admin',
//     loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
//   }
];