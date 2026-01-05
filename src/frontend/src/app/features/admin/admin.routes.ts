import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'categories', 
        loadComponent: () => import('./categories/category-list.component').then(m => m.CategoryListComponent) 
      },
      { 
        path: 'products', 
        loadComponent: () => import('./products/product-list.component').then(m => m.ProductListComponent) 
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./orders/order-list.component').then(m => m.OrderListComponent) 
      }
      // Các route quản lý sẽ thêm vào đây:
      // { path: 'categories', ... }
      // { path: 'products', ... }
      // { path: 'orders', ... }
    ]
  }
];