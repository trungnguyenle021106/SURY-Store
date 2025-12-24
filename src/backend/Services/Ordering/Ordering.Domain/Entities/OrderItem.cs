using BuildingBlocks.Core.Entities;

namespace Ordering.Domain.Entities
{
    public class OrderItem : BaseEntity<Guid>
    {
        public Guid OrderId { get; private set; }
        public Guid ProductId { get; private set; }
        public string ProductName { get; private set; } = default!;
        public decimal UnitPrice { get; private set; } 
        public int Quantity { get; private set; }
        public string PictureUrl { get; private set; } = default!;

        private OrderItem() { }

        public OrderItem(Guid orderId, Guid productId, string productName, decimal unitPrice, string pictureUrl, int quantity)
        {
            Id = Guid.NewGuid();
            OrderId = orderId;
            ProductId = productId;
            ProductName = productName;
            UnitPrice = unitPrice;
            Quantity = quantity;
            PictureUrl = pictureUrl;
        }
    }
}