using BuildingBlocks.Core.Entities;
using BuildingBlocks.Core.Exceptions;
using Ordering.Domain.Enums;
using Ordering.Domain.ValueObjects;

namespace Ordering.Domain.Entities
{
    public class Order : BaseEntity<Guid>
    {
        public Guid UserId { get; private set; }
        public DateTime OrderDate { get; private set; }
        public OrderStatus Status { get; private set; }
        public Address ShippingAddress { get; private set; } = default!;
        public decimal TotalPrice { get; private set; }
        public int PaymentMethod { get; private set; }

        private readonly List<OrderItem> _orderItems = new();
        public IReadOnlyCollection<OrderItem> OrderItems => _orderItems.AsReadOnly();

        private Order() { }

        public Order(Guid userId, decimal totalPrice, Address shippingAddress, int paymentMethod)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            TotalPrice = totalPrice;
            ShippingAddress = shippingAddress;
            PaymentMethod = paymentMethod;

            OrderDate = DateTime.UtcNow;
            Status = OrderStatus.Pending;
        }

        public void AddItem(Guid productId, string productName, decimal unitPrice, string pictureUrl, int quantity)
        {
            var item = new OrderItem(Id, productId, productName, unitPrice, pictureUrl, quantity);
            _orderItems.Add(item);
        }


        public void StartProcessing()
        {
            if (Status != OrderStatus.Pending)
                throw new DomainException("Chỉ có thể xử lý đơn hàng đang chờ xác nhận.");
            Status = OrderStatus.Processing;
        }

        public void MarkAsShipped()
        {
            if (Status != OrderStatus.Processing)
                throw new DomainException("Đơn hàng phải được soạn xong (Processing) trước khi giao.");
            Status = OrderStatus.Shipping;
        }

        public void CompleteOrder()
        {
            if (Status != OrderStatus.Shipping)
                throw new DomainException("Đơn hàng phải đang giao mới có thể hoàn thành.");
            Status = OrderStatus.Completed;
        }

        public void CancelOrder()
        {
            if (Status == OrderStatus.Shipping || Status == OrderStatus.Completed)
                throw new DomainException("Không thể hủy đơn hàng đã giao hoặc đã hoàn thành.");
            Status = OrderStatus.Cancelled;
        }
    }
}