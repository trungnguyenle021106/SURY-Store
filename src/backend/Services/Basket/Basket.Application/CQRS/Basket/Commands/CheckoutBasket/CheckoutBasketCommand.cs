using BuildingBlocks.Application.MediatR.CQRS;
using BuildingBlocks.Core.Enums;


namespace Basket.Application.CQRS.Basket.Commands.CheckoutBasket
{
    public record CheckoutBasketResult(bool IsSuccess);

    public record CheckoutBasketCommand(
        string UserName,
        string ReceiverName,
        string PhoneNumber,
        string Street,
        Wards Ward, 
        string? Note
    ) : ICommand<CheckoutBasketResult>;
}