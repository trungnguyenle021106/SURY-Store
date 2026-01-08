import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Import đúng các Model bạn cung cấp
import { 
  CartItem, 
  ShoppingCart, 
  GetBasketResponse, 
  StoreBasketRequest, 
  StoreBasketResponse, 
  CheckoutBasketRequest 
} from '../models/basket.models';

// Import SuccessResponse (cho API delete/checkout nếu cần)
import { SuccessResponse } from '../models/core.models'; 

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/basket`;
  private readonly CART_STORAGE_KEY = 'shop_cart_data';

  // --- STATE MANAGEMENT ---
  private cartSignal = signal<ShoppingCart | null>(null);

  // Computed Values
  cartCount = computed(() => {
    const cart = this.cartSignal();
    return cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  });

  cartTotal = computed(() => this.cartSignal()?.totalPrice ?? 0);

  // Public Signal (Readonly)
  cart = this.cartSignal.asReadonly();

  constructor() {
    this.loadFromLocalStorage();

    // --- EFFECT: ĐỒNG BỘ KHI LOGIN/LOGOUT ---
    effect(() => {
      const user = this.authService.currentUser();
      const currentLocalCart = untracked(() => this.cartSignal());

      if (user) {
        // --- TRƯỜNG HỢP 1: VỪA LOGIN ---
        if (currentLocalCart && currentLocalCart.items.length > 0) {
          // A. Có hàng ở Local -> Gửi lên Server để lưu (Merge)
          // Lưu ý: Vì API trả về StoreBasketResponse (chỉ có userName), 
          // nên ta không update state từ response này mà giữ nguyên state hiện tại (đã tính toán ở client).
          this.updateBasketApi(currentLocalCart.items).subscribe({
            next: () => {
                console.log('Synced local cart to server');
                // Tùy chọn: Muốn chắc ăn thì gọi getBasket() để lấy giá chuẩn server
                // this.getBasket().subscribe(); 
            },
            error: () => {
                // Nếu lỗi save, thử load lại hàng cũ từ server về để tránh lệch data
                this.getBasket().subscribe();
            }
          });
        } else {
          // B. Local rỗng -> Lấy hàng từ Server về
          this.getBasket().subscribe();
        }
      } else {
        // --- TRƯỜNG HỢP 2: LOGOUT ---
        // Xóa sạch giỏ hàng client
        this.updateLocalState(null);
      }
    });
  }

  // --- HELPER: CẬP NHẬT STATE & LOCALSTORAGE ---
  private updateLocalState(cart: ShoppingCart | null) {
    this.cartSignal.set(cart);
    if (cart) {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(this.CART_STORAGE_KEY);
    }
  }

  private loadFromLocalStorage() {
    const json = localStorage.getItem(this.CART_STORAGE_KEY);
    if (json) {
      try {
        const cart = JSON.parse(json) as ShoppingCart;
        this.cartSignal.set(cart);
      } catch {
        localStorage.removeItem(this.CART_STORAGE_KEY);
      }
    }
  }

  private get isLoggedIn(): boolean {
    return !!this.authService.currentUser();
  }

  // --- API CALLS (Dựa trên Model mới) ---
  
  // GET: Lấy giỏ hàng
  // Response là GetBasketResponse { cart: ShoppingCart }
  private getBasket(): Observable<ShoppingCart | null> {
    return this.http.get<GetBasketResponse>(this.baseUrl).pipe(
      map(response => response.cart), // Trích xuất cart từ response
      tap(cart => this.updateLocalState(cart)),
      catchError(() => of(null))
    );
  }

  // POST: Lưu giỏ hàng
  // Request là StoreBasketRequest { items: CartItem[] }
  // Response là StoreBasketResponse { userName: string } -> KHÔNG có cart trả về
  private updateBasketApi(items: CartItem[]): Observable<StoreBasketResponse> {
    const payload: StoreBasketRequest = { items };
    return this.http.post<StoreBasketResponse>(this.baseUrl, payload);
  }

  // DELETE: Xóa giỏ hàng
  private deleteBasketApi(): Observable<SuccessResponse> {
    return this.http.delete<SuccessResponse>(this.baseUrl);
  }

  // --- PUBLIC METHODS ---

  // 1. THÊM VÀO GIỎ
  addItemToBasket(product: any, quantity: number = 1): Observable<any> {
    // A. Tính toán Logic ở Client (Optimistic)
    const previousCart = this.cartSignal();
    const currentItems = previousCart?.items ? [...previousCart.items] : [];

    const existingItemIndex = currentItems.findIndex(x => x.productId === product.id);
    if (existingItemIndex !== -1) {
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      // Map đúng theo model CartItem
      currentItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        pictureUrl: product.imageUrl
      });
    }

    const newTotal = currentItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const newCart: ShoppingCart = {
      userId: this.authService.currentUser()?.id || 'guest', 
      items: currentItems,
      totalPrice: newTotal
    };

    // B. Cập nhật UI ngay lập tức
    this.updateLocalState(newCart);

    // C. Đồng bộ Server (Nếu đã login)
    if (this.isLoggedIn) {
      return this.updateBasketApi(currentItems).pipe(
          // Vì API không trả về cart mới, ta trả về data giả để component biết là thành công
          map(res => ({ success: true, userName: res.userName })) 
      );
    } else {
      return of({ success: true, message: 'Saved local' });
    }
  }

  // 2. XÓA MỘT MÓN
  removeItemFromBasket(productId: string): Observable<any> {
    const previousCart = this.cartSignal();
    if (!previousCart) return of(null);

    const newItems = previousCart.items.filter(x => x.productId !== productId);
    
    // Nếu xóa hết -> Xóa giỏ
    if (newItems.length === 0) {
        this.updateLocalState(null);
        return this.isLoggedIn ? this.deleteBasketApi() : of(true);
    }

    // Nếu còn -> Tính lại tiền
    const newTotal = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newCart: ShoppingCart = { ...previousCart, items: newItems, totalPrice: newTotal };

    this.updateLocalState(newCart);

    if (this.isLoggedIn) {
        return this.updateBasketApi(newItems);
    } else {
        return of(true);
    }
  }

  // 3. CHECKOUT
  // Payload: CheckoutBasketRequest
  checkout(payload: CheckoutBasketRequest): Observable<SuccessResponse> {
    if (!this.isLoggedIn) {
        return throwError(() => new Error('Vui lòng đăng nhập'));
    }

    return this.http.post<SuccessResponse>(`${this.baseUrl}/checkout`, payload).pipe(
        tap((res) => {
            if (res.isSuccess) {
                // Checkout thành công -> Xóa giỏ hàng local
                this.updateLocalState(null);
            }
        })
    );
  }
}