using BuildingBlocks.Infrastructure.Extensions;
using Carter;
using Mapster;
using MediatR;
using Ordering.Application.CQRS.Orders.Commands.CancelOrder;
using System.Security.Claims;

namespace Ordering.API.Endpoints.Orders
{
    public record CancelOrderResponse(bool IsSuccess);

    public class CancelOrderEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPatch("/orders/{id}/cancel", async (Guid id, ClaimsPrincipal user, ISender sender) =>
            {
                var userId = user.GetUserId();

                var isAdmin = user.IsInRole("Admin");

                var command = new CancelOrderCommand(id, userId, isAdmin);

                var result = await sender.Send(command);

                var response = result.Adapt<CancelOrderResponse>();

                return Results.Ok(response);
            })
            .WithName("CancelOrder")
            .WithSummary("Cancel an order")
            .WithDescription("Change order status to Cancelled if it's not shipped or completed.")
            .RequireAuthorization(); 
        }
    }
}