using BuildingBlocks.Core.Messaging;
using MassTransit;
using MediatR;
using Ordering.Application.CQRS.Orders.Commands.CreateOrder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ordering.Application.EventHandlers
{
    public class BasketCheckoutConsumer : IConsumer<BasketCheckoutEvent>
    {
        private readonly ISender _sender;

        public BasketCheckoutConsumer(ISender sender)
        {
            _sender = sender;
        }

        public async Task Consume(ConsumeContext<BasketCheckoutEvent> context)
        {
            var message = context.Message;

            // 1. Map dữ liệu từ Event sang Command
            // Lưu ý: Ta giả định UserName truyền từ Basket chính là UserId dạng Guid
            var command = new CreateOrderCommand(
                UserId: Guid.Parse(message.UserName),
                TotalPrice: message.TotalPrice,
                ShippingAddress: new AddressDto(
                    message.ReceiverName,
                    message.PhoneNumber,
                    message.Street,
                    message.Ward,
                    message.City,
                    message.Note
                ),
                PaymentMethod: message.PaymentMethod,
                OrderItems: message.Items.Select(i => new OrderItemDto(
                    i.ProductId,
                    i.ProductName,
                    i.UnitPrice,
                    i.Quantity,
                    i.PictureUrl
                )).ToList()
            );

            // 2. Gửi Command đi xử lý (Lưu vào SQL Server qua CreateOrderHandler)
            await _sender.Send(command);

            Console.WriteLine($"[Ordering Service] Đã xử lý xong BasketCheckoutEvent cho User: {message.UserName}");
        }
    }
}
