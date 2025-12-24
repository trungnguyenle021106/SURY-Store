using Basket.Application.Common.Interfaces;
using BuildingBlocks.Core.Messaging;
using MassTransit;
using MediatR;

namespace Basket.Application.CQRS.Basket.Commands.CheckoutBasket
{
    public class CheckoutBasketHandler : IRequestHandler<CheckoutBasketCommand, CheckoutBasketResult>
    {
        private readonly IBasketRepository _repository;
        private readonly IPublishEndpoint _publishEndpoint;

        public CheckoutBasketHandler(IBasketRepository repository, IPublishEndpoint publishEndpoint)
        {
            _repository = repository;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<CheckoutBasketResult> Handle(CheckoutBasketCommand command, CancellationToken cancellationToken)
        {
            var basket = await _repository.GetBasketAsync(command.UserId, cancellationToken);
            if (basket == null)
            {
                throw new KeyNotFoundException($"Giỏ hàng trống: {command.Email}");
            }

            var eventMessage = new BasketCheckoutEvent
            {
                UserId = command.UserId,
                Email = command.Email,
                TotalPrice = basket.TotalPrice,
                ReceiverName = command.ReceiverName,
                PhoneNumber = command.PhoneNumber,
                Street = command.Street,
                Ward = (int)command.Ward,
                City = "TP.Hồ Chí Minh",

                Note = command.Note,
                PaymentMethod = 1,
                Items = basket.Items.Select(i => new BasketCheckoutOrderItemModel(
                    Guid.Parse(i.ProductId),
                    i.ProductName,
                    i.Price,
                    i.Quantity,
                    i.PictureUrl
                )).ToList()
            };

            await _publishEndpoint.Publish(eventMessage, cancellationToken);

            await _repository.DeleteBasketAsync(command.UserId, cancellationToken);

            return new CheckoutBasketResult(true);
        }
    }
}