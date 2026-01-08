import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea'; // [MỚI] Dùng TextareaModule thay InputTextareaModule
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton'; // [MỚI] Để chọn địa chỉ

// Services & Models
import { BasketService } from '../../core/services/basket.service';
import { UserService } from '../../core/services/user.service';
import { CommonService } from '../../core/services/common.service';
import { AddressService } from '../../core/services/address.service'; // [MỚI]
import { Ward } from '../../core/models/common.models';
import { UserAddress } from '../../core/models/address.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, FormsModule,
    InputTextModule, TextareaModule, ButtonModule, DropdownModule, ToastModule, RadioButtonModule
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
  private addressService = inject(AddressService); // [MỚI]

  checkoutForm!: FormGroup;
  isLoading = false;
  
  wards: Ward[] = [];
  savedAddresses: UserAddress[] = []; // Danh sách địa chỉ đã lưu
  selectedAddressId: string | null = null; // ID địa chỉ đang chọn

  ngOnInit(): void {
    if (!this.basketService.cart() || this.basketService.cartCount() === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.checkoutForm = this.fb.group({
      receiverName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      street: ['', [Validators.required]],
      ward: [null, [Validators.required]], 
      note: ['']
    });

    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;

    forkJoin({
      wardsData: this.commonService.getWards(),
      profileData: this.userService.getMe(),
      addressData: this.addressService.getAddresses() // [MỚI] Load thêm sổ địa chỉ
    }).subscribe({
      next: (res) => {
        // 1. Set Wards
        this.wards = res.wardsData.wards;
        
        // 2. Set Saved Addresses
        this.savedAddresses = res.addressData.addresses;

        // 3. Logic Autofill thông minh
        // Ưu tiên 1: Địa chỉ mặc định trong Sổ địa chỉ
        const defaultAddr = this.savedAddresses.find(a => a.isDefault);
        
        if (defaultAddr) {
           this.onSelectAddress(defaultAddr);
        } else {
           // Ưu tiên 2: Lấy tên từ Profile điền tạm
           this.checkoutForm.patchValue({
             receiverName: res.profileData.fullName
           });
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // [MỚI] Hàm xử lý khi người dùng chọn 1 địa chỉ từ list
  onSelectAddress(addr: UserAddress) {
    this.selectedAddressId = addr.id;

    // Logic Map tên phường (trong sổ địa chỉ) -> ID phường (để dropdown hiểu)
    const foundWard = this.wards.find(w => w.name === addr.wardDescription);
    
    this.checkoutForm.patchValue({
      receiverName: addr.receiverName,
      phoneNumber: addr.phoneNumber,
      street: addr.street,
      ward: foundWard ? foundWard.key : null 
    });
    
    // Mark form as dirty để user biết dữ liệu đã thay đổi
    this.checkoutForm.markAsDirty();
  }

  // [MỚI] Khi user chọn "Nhập địa chỉ mới"
  onNewAddress() {
    this.selectedAddressId = 'new';
    this.checkoutForm.reset();
    // Lấy lại tên user điền vào cho tiện
    this.userService.getMe().subscribe(p => {
        this.checkoutForm.patchValue({ receiverName: p.fullName });
    });
  }

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
      this.messageService.add({ severity: 'warn', summary: 'Thông tin thiếu', detail: 'Vui lòng điền đầy đủ thông tin giao hàng.' });
      return;
    }

    this.isLoading = true;
    const formValue = this.checkoutForm.value;

    const currentCartItems = this.basketService.cart()?.items;
    const snapshotData = {
      orderId: 'PENDING', 
      customer: formValue,
      items: currentCartItems,
      total: this.finalTotal,
      shippingFee: this.shippingFee
    };

    const payload = {
      receiverName: formValue.receiverName,
      phoneNumber: formValue.phoneNumber,
      street: formValue.street,
      ward: formValue.ward,
      note: formValue.note
    };

    this.basketService.checkout(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.router.navigate(['/order-success'], { 
            state: { 
              ...snapshotData,
              orderId: res.message || 'ORD-NEW'
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