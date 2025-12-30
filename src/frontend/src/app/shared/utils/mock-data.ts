import { Category, Product, ProductStatus } from "../../core/models/catalog.models";

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Áo Kiểu & Sơ mi' }, // Gom nhóm Áo
  { id: '2', name: 'Quần & Chân Váy' }, // Gom nhóm Quần/Váy
  { id: '3', name: 'Đầm Liên' },         // Thêm Đầm (Món này shop nữ hay bán nhất)
  { id: '4', name: 'Phụ kiện' }          // Túi, kẹp tóc...
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Áo Blouse Cổ Nơ Tinh Tế',
    price: 250000,
    description: 'Chất liệu voan tơ mềm mại, phù hợp đi làm.',
    imageUrl: 'https://placehold.co/400x533/fdf4ff/86198f?text=Ao+Blouse', // Màu nền hồng phấn
    status: ProductStatus.Active,
    quantity: 20,
    categoryId: '1'
  },
  {
    id: 'p2',
    name: 'Chân Váy Xếp Ly Dáng Dài',
    price: 320000,
    description: 'Váy lưng cao che khuyết điểm, vải tuyết mưa dày dặn.',
    imageUrl: 'https://placehold.co/400x533/fdf4ff/86198f?text=Chan+Vay',
    status: ProductStatus.Active,
    quantity: 15,
    categoryId: '2'
  },
  {
    id: 'p3',
    name: 'Đầm Hoa Nhí Vintage',
    price: 450000,
    description: 'Thiết kế chiết eo nhẹ nhàng, họa tiết hoa nhí trend năm nay.',
    imageUrl: 'https://placehold.co/400x533/fff1f2/be123c?text=Dam+Vintage',
    status: ProductStatus.Active,
    quantity: 5, // Sắp hết
    categoryId: '3'
  },
  {
    id: 'p4',
    name: 'Áo Thun Trơn Dáng Ôm',
    price: 120000,
    description: 'Thun cotton 4 chiều, dễ phối với mọi loại quần.',
    imageUrl: 'https://placehold.co/400x533/fdf4ff/86198f?text=Ao+Thun',
    status: ProductStatus.Active,
    quantity: 50,
    categoryId: '1'
  },
  {
    id: 'p5',
    name: 'Quần Baggy Công Sở',
    price: 290000,
    description: 'Form chuẩn, tôn dáng, chất vải không nhăn.',
    imageUrl: 'https://placehold.co/400x533/fdf4ff/86198f?text=Quan+Baggy',
    status: ProductStatus.Active,
    quantity: 0, // Hết hàng
    categoryId: '2'
  },
  {
    id: 'p6',
    name: 'Túi Xách Da Mềm',
    price: 350000,
    description: 'Túi đeo chéo nhỏ gọn, đựng vừa điện thoại và ví.',
    imageUrl: 'https://placehold.co/400x533/f8fafc/475569?text=Tui+Xach',
    status: ProductStatus.Active,
    quantity: 10,
    categoryId: '4'
  },
  {
    id: 'p7',
    name: 'Set Kẹp Tóc Ngọc Trai',
    price: 55000,
    description: 'Phụ kiện xinh xắn tạo điểm nhấn cho mái tóc.',
    imageUrl: 'https://placehold.co/400x533/f8fafc/475569?text=Kep+Toc',
    status: ProductStatus.Active,
    quantity: 100,
    categoryId: '4'
  },
  {
    id: 'p8',
    name: 'Đầm Dự Tiệc Trễ Vai',
    price: 580000,
    description: 'Sang trọng, quyến rũ cho các buổi tiệc tối.',
    imageUrl: 'https://placehold.co/400x533/fff1f2/be123c?text=Dam+Tiec',
    status: ProductStatus.Active,
    quantity: 3,
    categoryId: '3'
  }
];