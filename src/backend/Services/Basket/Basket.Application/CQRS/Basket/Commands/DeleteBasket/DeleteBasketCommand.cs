using BuildingBlocks.Application.MediatR.CQRS;

namespace Basket.Application.CQRS.Basket.Commands.DeleteBasket
{
    public record DeleteBasketResult(bool IsSuccess);

    public record DeleteBasketCommand(string UserName) : ICommand<DeleteBasketResult>;
}