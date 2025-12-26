using Microsoft.EntityFrameworkCore;
using MediatR;
using Ordering.Application.Common.Interfaces;

namespace Ordering.Application.CQRS.Orders.Queries.GetOrdersByUserId
{
    public class GetOrdersByUserIdHandler : IRequestHandler<GetOrdersByUserIdQuery, GetOrdersByUserIdResult>
    {
        private readonly IOrderingDbContext _dbContext;

        public GetOrdersByUserIdHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<GetOrdersByUserIdResult> Handle(GetOrdersByUserIdQuery query, CancellationToken cancellationToken)
        {
            var orders = await _dbContext.Orders
                .Include(o => o.OrderItems) 
                .AsNoTracking() 
                .Where(o => o.UserId == query.UserId)
                .OrderByDescending(o => o.OrderDate) 
                .ToListAsync(cancellationToken);

            var orderDtos = orders.Select(o => new OrderDto(
                Id: o.Id,
                OrderDate: o.OrderDate,
                Status: o.Status,
                TotalPrice: o.TotalPrice,
                PaymentMethod: o.PaymentMethod,
                ShippingAddress: new AddressDto(
                    o.ShippingAddress.ReceiverName,
                    o.ShippingAddress.PhoneNumber,
                    o.ShippingAddress.Street,
                    $"{o.ShippingAddress.Street}, {o.ShippingAddress.City}" 
                ),
                OrderItems: o.OrderItems.Select(oi => new OrderItemDto(
                    oi.ProductId,
                    oi.ProductName,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.PictureUrl
                )).ToList()
            ));

            return new GetOrdersByUserIdResult(orderDtos);
        }
    }
}