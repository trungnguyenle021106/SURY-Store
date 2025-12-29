import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerService } from './core/services/customer.service';
import { UserAddress, Ward } from './core/models/user.model';
import { AuthService } from './core/services/auth.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html', 
  styleUrl: './app.component.scss',     
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  // Inject Services
  authService = inject(AuthService);
  customerService = inject(CustomerService);
  fb = inject(FormBuilder);

  // Local UI State
  viewState = signal<'login' | 'register' | 'dashboard'>('login');
  isLoading = signal<boolean>(false);
  showAddressModal = signal<boolean>(false);
  toastMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);
  
  // Data Signals
  addresses = signal<UserAddress[]>([]);
  wards = signal<Ward[]>([]);

  // Forms
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', [Validators.required]]
  });

  ngOnInit() {
    this.authService.refreshToken().subscribe({
      next: () => {
        this.viewState.set('dashboard');
        this.loadCustomerData();
      },
      error: () => this.viewState.set('login')
    });
  }

  // --- Handlers (Kết nối UI -> Service) ---
  
  handleLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showToast('Đăng nhập thành công!', 'success');
        this.viewState.set('dashboard');
        this.loadCustomerData();
      },
      error: () => {
        this.isLoading.set(false);
        this.showToast('Sai thông tin đăng nhập!', 'error');
      }
    });
  }

  handleRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showToast('Đăng ký thành công! Hãy đăng nhập.', 'success');
        this.viewState.set('login');
      },
      error: () => {
        this.isLoading.set(false);
        this.showToast('Lỗi đăng ký. Vui lòng thử lại.', 'error');
      }
    });
  }

  handleLogout() {
    this.authService.logout().subscribe(() => {
      this.viewState.set('login');
      this.showToast('Đã đăng xuất.', 'success');
    });
  }

  // --- Customer Data Methods ---

  loadCustomerData() {
    this.customerService.getAddresses().subscribe({
      next: (data) => this.addresses.set(data),
      error: () => this.showToast('Không tải được danh sách địa chỉ.', 'error')
    });
  }

  handleDeleteAddress(id: string) {
    if(!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    
    this.customerService.deleteAddress(id).subscribe({
      next: () => {
        this.addresses.update(list => list.filter(a => a.id !== id));
        this.showToast('Đã xóa địa chỉ.', 'success');
      },
      error: () => this.showToast('Lỗi khi xóa địa chỉ.', 'error')
    });
  }

  handleSetDefault(id: string) {
    this.customerService.setDefaultAddress(id).subscribe({
      next: () => {
        this.loadCustomerData(); // Reload để cập nhật UI
        this.showToast('Đã đặt làm địa chỉ mặc định.', 'success');
      }
    });
  }

  // --- Utils ---
  showToast(text: string, type: 'success' | 'error') {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
