using BuildingBlocks.Application.MediatR.CQRS;

namespace Basket.Application.CQRS.Basket.Commands.StoreBasket
{
    public record CartItemDto(
        int Quantity,
        decimal Price,
        string ProductId,
        string ProductName,
        string PictureUrl
    );

    public record StoreBasketResult(string UserName);

    public record StoreBasketCommand(string UserName, List<CartItemDto> Items)
        : ICommand<StoreBasketResult>;
}