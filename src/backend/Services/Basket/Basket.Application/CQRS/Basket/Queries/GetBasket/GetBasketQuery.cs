using Basket.Domain.Entities;
using BuildingBlocks.Application.MediatR.CQRS;

namespace Basket.Application.CQRS.Basket.Queries.GetBasket
{
    public record GetBasketResult(ShoppingCart Cart);
    public record GetBasketQuery(string UserName) : IQuery<GetBasketResult>;
}