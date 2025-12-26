using Carter;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.CQRS.Orders.Commands.CancelOrder;

namespace Ordering.API.Endpoints.Orders
{

    public record CancelOrderResponse(bool IsSuccess);

    public class CancelOrderEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPatch("/orders/{id}/cancel", async (Guid id, ISender sender) =>
            {
                var command = new CancelOrderCommand(id);

                var result = await sender.Send(command);

                var response = result.Adapt<CancelOrderResponse>();

                return Results.Ok(response);
            })
            .WithName("CancelOrder")
            .WithSummary("Cancel an order")
            .WithDescription("Change order status to Cancelled if it's not shipped or completed.");
        }
    }
}