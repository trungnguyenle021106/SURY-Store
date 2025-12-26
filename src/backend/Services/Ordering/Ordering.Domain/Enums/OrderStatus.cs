using System.ComponentModel;

namespace Ordering.Domain.Enums
{
    public enum OrderStatus
    {
        [Description("Chờ xác nhận")]
        Pending = 1,

        [Description("Đang xử lý")]
        Processing = 2,

        [Description("Đang giao hàng")]
        Shipping = 3,

        [Description("Hoàn thành")]
        Completed = 4,

        [Description("Đã hủy")]
        Cancelled = 5,

        [Description("Hết hàng")]
        OutOfStock = 6
    }
}