using Microsoft.EntityFrameworkCore;
using MediatR;
using Ordering.Application.Common.Interfaces;

namespace Ordering.Application.CQRS.Orders.Queries.GetOrderById
{
    public class GetOrderByIdHandler : IRequestHandler<GetOrderByIdQuery, GetOrderByIdResult>
    {
        private readonly IOrderingDbContext _dbContext;

        public GetOrderByIdHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<GetOrderByIdResult> Handle(GetOrderByIdQuery query, CancellationToken cancellationToken)
        {
            var order = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == query.Id, cancellationToken);

            if (order == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng với mã: {query.Id}");
            }

            var orderDto = new OrderDto(
                Id: order.Id,
                OrderDate: order.OrderDate,
                Status: order.Status.ToString(),
                StatusId: (int)order.Status,
                TotalPrice: order.TotalPrice,
                PaymentMethod: order.PaymentMethod,
                ShippingAddress: new AddressDto(
                    order.ShippingAddress.ReceiverName,
                    order.ShippingAddress.PhoneNumber,
                    order.ShippingAddress.Street,
                    $"{order.ShippingAddress.Street}, {order.ShippingAddress.City}"
                ),
                OrderItems: order.OrderItems.Select(oi => new OrderItemDto(
                    oi.ProductId,
                    oi.ProductName,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.PictureUrl,
                    oi.Quantity * oi.UnitPrice
                )).ToList()
            );

            return new GetOrderByIdResult(orderDto);
        }
    }
}