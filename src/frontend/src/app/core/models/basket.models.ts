// --- ENTITIES ---
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  pictureUrl: string;
}

export interface ShoppingCart {
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

// --- RESPONSE MODELS (Dữ liệu nhận về) ---

// GET /basket
export interface GetBasketResponse {
  cart: ShoppingCart;
}

// POST /basket
export interface StoreBasketResponse {
  userName: string; // Backend trả về userId sau khi lưu thành công
}

// --- REQUEST MODELS (Dữ liệu gửi đi) ---

// POST /basket (Chỉ gửi items)
export interface StoreBasketRequest {
  items: CartItem[];
}

// POST /basket/checkout (Thông tin giao hàng COD)
export interface CheckoutBasketRequest {
  receiverName: string;
  phoneNumber: string;
  street: string;
  ward: number; // ID/Key của phường (map với Common Service)
  note?: string; // Ghi chú giao hàng (Optional)
}