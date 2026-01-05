import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog'; // Modal Thêm/Sửa
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Hộp thoại xác nhận xóa
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { AddressService } from '../../../core/services/address.service';
import { UserAddress } from '../../../core/models/address.models';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, DialogModule, InputTextModule, DropdownModule, CheckboxModule,
    ToastModule, TagModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './address-book.component.html',
})
export class AddressBookComponent implements OnInit {
  addressService = inject(AddressService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  fb = inject(FormBuilder);

  addresses: UserAddress[] = [];
  isLoading = false;
  isSaving = false;

  // Dialog State
  displayDialog = false;
  isEditMode = false;
  currentEditId: string | null = null;
  addressForm: FormGroup;

  // Mock Wards (Giống trang Checkout)
  wards = [
    { id: 1, name: 'Phường 1' },
    { id: 2, name: 'Phường 2' },
    { id: 3, name: 'Phường Bến Nghé' },
    { id: 4, name: 'Phường Tân Định' }
  ];

  constructor() {
    this.addressForm = this.fb.group({
      receiverName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      street: ['', Validators.required],
      ward: [null, Validators.required],
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.isLoading = true;
    this.addressService.getAddresses().subscribe({
      next: (res) => {
        this.addresses = res.addresses;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Mock data nếu API chưa chạy
        this.addresses = [];
      }
    });
  }

  openDialog(addr?: UserAddress) {
    this.displayDialog = true;
    if (addr) {
      this.isEditMode = true;
      this.currentEditId = addr.id;
      // Patch value. Lưu ý: Cần map tên phường về ID nếu có thể. Ở đây ta giả định wardDescription map được.
      // Vì mock data đơn giản nên ta chỉ patch các field text, dropdown ward có thể không khớp nếu không có logic map ngược.
      this.addressForm.patchValue({
        receiverName: addr.receiverName,
        phoneNumber: addr.phoneNumber,
        street: addr.street,
        isDefault: addr.isDefault
        // ward: ... cần logic map từ string -> id
      });
    } else {
      this.isEditMode = false;
      this.currentEditId = null;
      this.addressForm.reset({ isDefault: false });
    }
  }

  saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = this.addressForm.value;

    const request$ = this.isEditMode && this.currentEditId
      ? this.addressService.updateAddress(this.currentEditId, payload)
      : this.addressService.createAddress(payload) as Observable<any>;
    
    request$.subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã lưu địa chỉ.' });
        this.displayDialog = false;
        this.loadAddresses(); // Reload list
        this.isSaving = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lưu địa chỉ.' });
        this.isSaving = false;
      }
    });
  }

  deleteAddress(id: string) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.addressService.deleteAddress(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Đã xóa', detail: 'Xóa địa chỉ thành công' });
            this.loadAddresses();
          }
        });
      }
    });
  }

  setDefault(id: string) {
    this.addressService.setDefaultAddress(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Cập nhật', detail: 'Đã đặt làm mặc định' });
        this.loadAddresses();
      }
    });
  }
}