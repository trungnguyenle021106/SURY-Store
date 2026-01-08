import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs'; // Thêm forkJoin

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { AddressService } from '../../../core/services/address.service';
import { CommonService } from '../../../core/services/common.service'; // Import CommonService
import { UserAddress } from '../../../core/models/address.models';
import { Ward } from '../../../core/models/common.models'; // Import Ward model

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
  commonService = inject(CommonService); // Inject CommonService
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  fb = inject(FormBuilder);

  addresses: UserAddress[] = [];
  wards: Ward[] = []; // Danh sách phường từ API

  isLoading = false;
  isSaving = false;

  displayDialog = false;
  isEditMode = false;
  currentEditId: string | null = null;
  addressForm: FormGroup;

  constructor() {
    this.addressForm = this.fb.group({
      receiverName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      street: ['', Validators.required],
      ward: [null, Validators.required], // Binding vào ID (number)
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.loadInitialData();
  }

  // Load cả danh sách địa chỉ và danh sách phường cùng lúc
  loadInitialData() {
    this.isLoading = true;
    
    forkJoin({
      addressRes: this.addressService.getAddresses(),
      wardRes: this.commonService.getWards()
    }).subscribe({
      next: ({ addressRes, wardRes }) => {
        this.addresses = addressRes.addresses;
        this.wards = wardRes.wards;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu.' });
      }
    });
  }

  loadAddressesOnly() {
    this.isLoading = true;
    this.addressService.getAddresses().subscribe({
        next: (res) => {
            this.addresses = res.addresses;
            this.isLoading = false;
        },
        error: () => this.isLoading = false
    });
  }

  openDialog(addr?: UserAddress) {
    this.displayDialog = true;
    
    if (addr) {
      this.isEditMode = true;
      this.currentEditId = addr.id;
      
      // [SỬA LOGIC] Tìm key dựa trên name
      // API Address trả về "wardDescription" (VD: "Phường Thủ Dầu Một")
      // API Ward trả về "name" (VD: "Phường Thủ Dầu Một")
      const foundWard = this.wards.find(w => w.name === addr.wardDescription);
      const wardKey = foundWard ? foundWard.key : null;

      this.addressForm.patchValue({
        receiverName: addr.receiverName,
        phoneNumber: addr.phoneNumber,
        street: addr.street,
        isDefault: addr.isDefault,
        ward: wardKey // Patch chuỗi key (VD: "PhuongThuDauMot")
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
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã lưu địa chỉ.' });
        this.displayDialog = false;
        this.loadAddressesOnly(); // Chỉ cần load lại danh sách địa chỉ
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
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.addressService.deleteAddress(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Đã xóa', detail: 'Xóa địa chỉ thành công' });
            this.loadAddressesOnly();
          }
        });
      }
    });
  }

  setDefault(id: string) {
    this.addressService.setDefaultAddress(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Cập nhật', detail: 'Đã đặt làm mặc định' });
        this.loadAddressesOnly();
      }
    });
  }
}