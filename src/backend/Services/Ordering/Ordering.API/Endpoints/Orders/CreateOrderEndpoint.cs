using Carter;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.CQRS.Orders.Commands.CreateOrder;

namespace Ordering.API.Endpoints.Orders
{
    public record CreateOrderRequest(
        Guid UserId,
        decimal TotalPrice,
        AddressRequest ShippingAddress,
        int PaymentMethod,
        List<OrderItemRequest> OrderItems);

    public record AddressRequest(
        string ReceiverName,
        string PhoneNumber,
        string Street,
        int Ward,
        string City,
        string? Note);

    public record OrderItemRequest(
        Guid ProductId,
        string ProductName,
        decimal UnitPrice,
        int Quantity,
        string PictureUrl);

    public record CreateOrderResponse(Guid Id);

    public class CreateOrderEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/orders", async ([FromBody] CreateOrderRequest request, ISender sender) =>
            {
                var command = request.Adapt<CreateOrderCommand>();

                var result = await sender.Send(command);

                var response = result.Adapt<CreateOrderResponse>();

                return Results.Created($"/orders/{response.Id}", response);
            })
            .WithName("CreateOrder")
            .WithSummary("Create new order")
            .WithDescription("Create a new order in the system.");
        }
    }
}