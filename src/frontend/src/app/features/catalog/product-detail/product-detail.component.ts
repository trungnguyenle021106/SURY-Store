import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Models & Data
import { Product } from '../../../core/models/catalog.models';
import { MOCK_PRODUCTS } from '../../../shared/utils/mock-data';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    ButtonModule, InputNumberModule, TagModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  product: Product | null = null;
  relatedProducts: Product[] = []; // Vẫn giữ gợi ý SP khác để khách không bị "cụt đường"
  quantity: number = 1;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.loadProduct(id);
    });
  }

  loadProduct(id: string | null) {
    if (!id) return;
    
    const found = MOCK_PRODUCTS.find(p => p.id === id);
    if (found) {
      this.product = found;
      this.quantity = 1;
      
      // Lấy 4 sản phẩm gợi ý (trừ sản phẩm đang xem)
      this.relatedProducts = MOCK_PRODUCTS.filter(p => p.id !== id).slice(0, 4);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addToCart() {
    if (!this.product) return;
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Thành công', 
      detail: `Đã thêm ${this.quantity} ${this.product.name} vào giỏ!` 
    });
  }

  // Helper hiển thị trạng thái text
  get inventoryStatus() {
    if (!this.product) return { label: '', severity: 'secondary' as const };
    if (this.product.quantity === 0) return { label: 'Hết hàng', severity: 'danger' as const };
    if (this.product.quantity < 5) return { label: 'Sắp hết hàng', severity: 'warning' as const };
    return { label: 'Còn hàng', severity: 'success' as const };
  }
}