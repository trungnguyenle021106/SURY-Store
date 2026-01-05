import { Routes } from '@angular/router';
import { ProfileLayoutComponent } from './layout/profile-layout.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileLayoutComponent,
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      { 
        path: 'info', 
        loadComponent: () => import('./info/profile-info.component').then(m => m.ProfileInfoComponent) 
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./orders/order-history.component').then(m => m.OrderHistoryComponent) 
      },
      { 
        path: 'addresses', 
        loadComponent: () => import('./addresses/address-book.component').then(m => m.AddressBookComponent) 
      },
      { 
        path: 'password', 
        loadComponent: () => import('./password/change-password.component').then(m => m.ChangePasswordComponent) 
      }
      // Các route khác (addresses, password) sẽ thêm sau
    ]
  }
];