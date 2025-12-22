using Basket.Application.CQRS.Basket.Commands.CheckoutBasket;
using BuildingBlocks.Core.Enums;
using Carter;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Basket.API.Endpoints.Basket
{
    public record CheckoutBasketRequest(
        string UserName,
        string ReceiverName,
        string PhoneNumber,
        string Street,
        Wards Ward,
        string? Note
    );

    public record CheckoutBasketResponse(bool IsSuccess);

    public class CheckoutBasketEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/basket/checkout", async ([FromBody] CheckoutBasketRequest request, ISender sender) =>
            {
                var command = request.Adapt<CheckoutBasketCommand>();

                var result = await sender.Send(command);

                var response = result.Adapt<CheckoutBasketResponse>();

                return Results.Accepted("/basket/checkout", response);
            })
            .WithName("CheckoutBasket")
            .WithSummary("Checkout basket (COD)")
            .WithDescription("Checkout using strict UserAddress format.")
            .RequireAuthorization();
        }
    }
}