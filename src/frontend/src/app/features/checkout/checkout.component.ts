import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { BasketService } from '../../core/services/basket.service';
import { UserService } from '../../core/services/user.service';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    InputTextModule, InputTextarea, ButtonModule, DropdownModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  
  public basketService = inject(BasketService);
  private userService = inject(UserService);
  private commonService = inject(CommonService);

  checkoutForm!: FormGroup;
  isLoading = false;

  // Mock Wards (Vì chưa có API thật chạy được, ta dùng mock cho UI)
  // Thực tế bạn sẽ gọi commonService.getWards()
  wards = [
    { id: 1, name: 'Phường 1' },
    { id: 2, name: 'Phường 2' },
    { id: 3, name: 'Phường 3' },
    { id: 4, name: 'Phường Bến Nghé' },
    { id: 5, name: 'Phường Tân Định' }
  ];

  ngOnInit(): void {
    // 1. Init Form
    this.checkoutForm = this.fb.group({
      receiverName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      street: ['', [Validators.required]], // Số nhà, tên đường
      ward: [null, [Validators.required]], // ID Phường
      note: ['']
    });

    // 2. Check giỏ hàng (Nếu rỗng thì đá về trang chủ)
    if (!this.basketService.cart() || this.basketService.cartCount() === 0) {
      this.router.navigate(['/']);
      return;
    }

    // 3. Load User Info (Autofill)
    this.loadUserProfile();
    
    // 4. Load Wards (Nếu có API thật thì uncomment dòng dưới)
    // this.loadWards(); 
  }

  loadUserProfile() {
    this.userService.getMe().subscribe({
      next: (profile) => {
        // Tự động điền tên, sđt từ profile
        this.checkoutForm.patchValue({
          receiverName: profile.fullName,
          // Giả sử lấy SĐT từ địa chỉ mặc định hoặc field nào đó nếu có
          // phoneNumber: profile.phoneNumber 
        });

        // Nếu user đã có địa chỉ trong profile, lấy địa chỉ đầu tiên hoặc mặc định để điền
        if (profile.addresses && profile.addresses.length > 0) {
          const defaultAddr = profile.addresses.find(a => a.isDefault) || profile.addresses[0];
          this.checkoutForm.patchValue({
            receiverName: defaultAddr.receiverName,
            phoneNumber: defaultAddr.phoneNumber,
            street: defaultAddr.street,
            // ward: defaultAddr.wardId // Cần map đúng ID
          });
        }
      },
      error: () => console.log('Khách vãng lai hoặc chưa login')
    });
  }

  // Tính phí ship
  get shippingFee(): number {
    const total = this.basketService.cartTotal();
    return total >= 500000 ? 0 : 30000;
  }

  get finalTotal(): number {
    return this.basketService.cartTotal() + this.shippingFee;
  }

 onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng điền đầy đủ thông tin giao hàng.' });
      return;
    }

    this.isLoading = true;
    const formValue = this.checkoutForm.value;

    // 1. Lưu lại giỏ hàng hiện tại trước khi bị Service xóa mất
    const currentCart = this.basketService.cart(); 
    const finalTotal = this.finalTotal;
    const shippingFee = this.shippingFee;

    const payload = {
      receiverName: formValue.receiverName,
      phoneNumber: formValue.phoneNumber,
      street: formValue.street,
      ward: formValue.ward,
      note: formValue.note
    };
   this.router.navigate(['/order-success'], { 
            state: { 
              orderId: 'ORD-' + new Date().getTime(), // Giả lập mã đơn hàng
              customer: formValue,
              items: currentCart?.items,
              total: finalTotal,
              shippingFee: shippingFee
            } 
          });
    this.basketService.checkout(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // 2. Chuyển trang kèm theo dữ liệu đơn hàng (State)
          this.router.navigate(['/order-success'], { 
            state: { 
              orderId: 'ORD-' + new Date().getTime(), // Giả lập mã đơn hàng
              customer: formValue,
              items: currentCart?.items,
              total: finalTotal,
              shippingFee: shippingFee
            } 
          });
        } else {
           this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: res.message || 'Có lỗi xảy ra' });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi hệ thống', detail: 'Không thể đặt hàng lúc này.' });
      }
    });
}
}