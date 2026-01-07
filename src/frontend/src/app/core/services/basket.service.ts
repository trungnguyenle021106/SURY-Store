import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem, CheckoutBasketRequest, GetBasketResponse, ShoppingCart, StoreBasketRequest, StoreBasketResponse } from '../models/basket.models';
import { SuccessResponse } from '../models/core.models';
import { AuthService } from './auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // Inject AuthService
  private baseUrl = `${environment.apiUrl}/basket`;
  private readonly CART_STORAGE_KEY = 'shop_cart_data';

  // --- STATE MANAGEMENT ---
  private cartSignal = signal<ShoppingCart | null>(null);

  cartCount = computed(() => {
    const cart = this.cartSignal();
    return cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  });

  cartTotal = computed(() => this.cartSignal()?.totalPrice ?? 0);

  // Expose ra ngoài cho Component dùng (Readonly)
  cart = this.cartSignal.asReadonly();

  constructor() {
    // 1. Luôn load Local Storage trước (để UI có dữ liệu ngay lập tức)
    this.loadFromLocalStorage();

    // 2. [MỚI] Sử dụng effect để theo dõi trạng thái Login
    // Bất cứ khi nào authService.currentUser() thay đổi (Login/Logout/F5), đoạn code này sẽ chạy
    effect(() => {
      const user = this.authService.currentUser();
      
      if (user) {
        // A. Nếu User ĐÃ đăng nhập: Gọi API lấy giỏ hàng từ Server về
        // (Server là nguồn chuẩn, sẽ ghi đè LocalStorage để đồng bộ)
        this.getBasket().subscribe(); 
      } else {
        // B. Nếu User CHƯA đăng nhập (hoặc vừa Logout):
        // Ta giữ nguyên LocalStorage hiện tại (chế độ Guest)
        // Hoặc muốn bảo mật hơn thì xóa giỏ hàng khi logout:
        // this.updateLocalState(null); 
      }
    });
  }

  // --- HELPER QUAN TRỌNG: UPDATE LOCAL STATE ---
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

  // --- HELPER: CHECK LOGIN STATUS ---
  // Sử dụng trực tiếp Signal từ AuthService
  private get isLoggedIn(): boolean {
    return !!this.authService.currentUser();
  }

  // --- API CALLS (PRIVATE/INTERNAL) ---
  
  // Lấy giỏ hàng từ Server
  private getBasket(): Observable<GetBasketResponse> {
    return this.http.get<GetBasketResponse>(this.baseUrl).pipe(
      tap(response => {
        // Lấy về thành công -> Cập nhật LocalStorage luôn
        this.updateLocalState(response.cart);
      }),
      catchError(err => {
        // Lỗi (VD: chưa có giỏ trên server) -> Giữ nguyên Local hoặc set null tùy logic
        // Ở đây ta không làm gì để tránh mất giỏ hàng Guest đang có
        return of({ cart: this.cartSignal() } as GetBasketResponse);
      })
    );
  }

  private updateBasketApi(items: CartItem[]): Observable<StoreBasketResponse> {
    const payload: StoreBasketRequest = { items };
    return this.http.post<StoreBasketResponse>(this.baseUrl, payload);
  }

  private deleteBasketApi(): Observable<SuccessResponse> {
    return this.http.delete<SuccessResponse>(this.baseUrl);
  }

  // --- PUBLIC ACTIONS (Dùng cho Component) ---

  // 1. THÊM VÀO GIỎ
  addItemToBasket(product: any, quantity: number = 1): Observable<any> {
    // A. Logic tính toán (Client Side)
    const previousCart = this.cartSignal();
    const currentItems = previousCart?.items ? [...previousCart.items] : [];
    
    const existingItemIndex = currentItems.findIndex(x => x.productId === product.id);
    if (existingItemIndex !== -1) {
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      currentItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        pictureUrl: product.imageUrl
      });
    }

    // Tính tổng tiền tạm (Client)
    const newTotal = currentItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Tạo object giỏ hàng mới
    // Lưu ý: Nếu chưa login, dùng tạm userId là 'guest'
    const newCart: ShoppingCart = {
      userId: this.authService.currentUser()?.id || 'guest', 
      items: currentItems,
      totalPrice: newTotal
    };

    // B. Cập nhật UI ngay lập tức (Optimistic)
    this.updateLocalState(newCart);

    // C. Phân nhánh xử lý Guest vs User
    if (this.isLoggedIn) {
      // User thật: Gọi API lưu lên Server
      return this.updateBasketApi(currentItems);
    } else {
      // Guest: Chỉ lưu Local (đã làm ở bước B) -> Trả về Success giả để Component hiện thông báo
      return of({ success: true, message: 'Saved to local storage' });
    }
  }

  // 2. XÓA KHỎI GIỎ
  removeItemFromBasket(productId: string): Observable<any> {
    const previousCart = this.cartSignal();
    if (!previousCart) return of(null);

    const newItems = previousCart.items.filter(x => x.productId !== productId);
    
    // Nếu xóa hết sạch
    if (newItems.length === 0) {
        this.updateLocalState(null);
        return this.isLoggedIn ? this.deleteBasketApi() : of(true);
    }

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
  checkout(payload: CheckoutBasketRequest): Observable<SuccessResponse> {
    // Chặn ngay nếu chưa Login
    if (!this.isLoggedIn) {
      return throwError(() => new Error('Vui lòng đăng nhập để thanh toán'));
    }

    return this.http.post<SuccessResponse>(`${this.baseUrl}/checkout`, payload).pipe(
      tap(res => {
        if (res.isSuccess) {
          // Thanh toán xong -> Xóa sạch giỏ
          this.updateLocalState(null);
        }
      })
    );
  }
}