using BuildingBlocks.Core.Enums;
using MediatR;
using Ordering.Application.Common.Interfaces;
using Ordering.Domain.Entities;
using Ordering.Domain.ValueObjects;

namespace Ordering.Application.CQRS.Orders.Commands.CreateOrder
{
    public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, CreateOrderResult>
    {
        private readonly IOrderingDbContext _dbContext;

        public CreateOrderHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CreateOrderResult> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
        {


            var shippingAddress = new Address(
                command.ShippingAddress.ReceiverName,
                command.ShippingAddress.PhoneNumber,
                command.ShippingAddress.Street,
                (Wards)command.ShippingAddress.Ward, 
                command.ShippingAddress.City,
                command.ShippingAddress.Note
            );

            var order = new Order(
                orderId,
                command.UserId,
                command.TotalPrice,
                shippingAddress,
                command.PaymentMethod
            );

            foreach (var item in command.OrderItems)
            {
                order.AddItem(
                    item.ProductId,
                    item.ProductName,
                    item.UnitPrice,
                    item.PictureUrl,
                    item.Quantity
                );
            }

            await _dbContext.Orders.AddAsync(order, cancellationToken);

            return new CreateOrderResult(order.Id);
        }
    }
}