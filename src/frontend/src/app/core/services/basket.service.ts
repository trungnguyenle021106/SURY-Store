import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem, CheckoutBasketRequest, GetBasketResponse, ShoppingCart, StoreBasketRequest, StoreBasketResponse } from '../models/basket.models';
import { SuccessResponse } from '../models/core.models';


@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/basket`;

  // --- STATE MANAGEMENT (Angular 19 Signals) ---
  // Lưu trữ giỏ hàng hiện tại để UI (Header, Cart Page) binding dữ liệu
  private cartSignal = signal<ShoppingCart | null>(null);

  // Selector: Tổng số lượng item (dùng cho Badge trên Header)
  cartCount = computed(() => {
    const cart = this.cartSignal();
    return cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  });

  // Selector: Tổng tiền (Frontend tự tính hiển thị tạm thời, hoặc dùng totalPrice từ Backend)
  cartTotal = computed(() => this.cartSignal()?.totalPrice ?? 0);

  // Public Signal để Component đọc dữ liệu
  cart = this.cartSignal.asReadonly();

  // --- API METHODS ---

  // 1. GET /basket
  getBasket(): Observable<GetBasketResponse> {
    return this.http.get<GetBasketResponse>(this.baseUrl).pipe(
      tap(response => {
        // Cập nhật State khi lấy dữ liệu về thành công
        this.cartSignal.set(response.cart);
      }),
      catchError(err => {
        // Trường hợp giỏ hàng rỗng hoặc lỗi 404, set null
        this.cartSignal.set(null);
        throw err;
      })
    );
  }

  // 2. POST /basket (Lưu giỏ hàng)
  // Payload: { items: [...] }
  updateBasket(items: CartItem[]): Observable<StoreBasketResponse> {
    const payload: StoreBasketRequest = { items };
    
    return this.http.post<StoreBasketResponse>(this.baseUrl, payload).pipe(
      tap(() => {
        // Sau khi lưu thành công, cập nhật lại State cục bộ
        // Lưu ý: Ta cần giữ lại userId cũ hoặc lấy từ AuthService nếu cần
        const currentCart = this.cartSignal();
        const newTotalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        this.cartSignal.set({
          userId: currentCart?.userId || '', 
          items: items,
          totalPrice: newTotalPrice
        });
      })
    );
  }

  // 3. POST /basket/checkout (Thanh toán COD)
  checkout(payload: CheckoutBasketRequest): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/checkout`, payload).pipe(
      tap(res => {
        if (res.isSuccess) {
          // Thanh toán thành công -> Xóa giỏ hàng trong State
          this.cartSignal.set(null);
        }
      })
    );
  }

  // 4. DELETE /basket (Xóa giỏ)
  deleteBasket(): Observable<SuccessResponse> {
    return this.http.delete<SuccessResponse>(this.baseUrl).pipe(
      tap(res => {
        if (res.isSuccess) {
          this.cartSignal.set(null);
        }
      })
    );
  }

  // --- HELPER METHODS (Logic phía Frontend) ---

  // Hàm thêm sản phẩm vào giỏ (Logic xử lý mảng items trước khi gọi API)
  addItemToBasket(product: any, quantity: number = 1) {
    const currentItems = this.cartSignal()?.items ? [...this.cartSignal()!.items] : [];
    const existingItemIndex = currentItems.findIndex(x => x.productId === product.id);

    if (existingItemIndex !== -1) {
      // Đã có -> Tăng số lượng
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      // Chưa có -> Thêm mới
      currentItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        pictureUrl: product.imageUrl
      });
    }

    // Gọi API update
    // Subscribe ngay tại đây hoặc trả về Observable để Component xử lý loading/notification
    this.updateBasket(currentItems).subscribe();
  }
  
  // Hàm xóa 1 sản phẩm khỏi danh sách (Frontend xử lý mảng rồi gọi update)
  removeItemFromBasket(productId: string) {
    const currentItems = this.cartSignal()?.items || [];
    const newItems = currentItems.filter(x => x.productId !== productId);
    this.updateBasket(newItems).subscribe();
  }
}