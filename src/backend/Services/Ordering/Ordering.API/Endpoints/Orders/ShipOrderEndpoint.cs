using Carter;
using Mapster;
using MediatR;
using Ordering.Application.CQRS.Orders.Commands.ShipOrder;

namespace Ordering.API.Endpoints.Orders
{
    public record ShipOrderResponse(bool IsSuccess);

    public class ShipOrderEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPatch("/orders/{id}/ship", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new ShipOrderCommand(id));

                var response = result.Adapt<ShipOrderResponse>();

                return Results.Ok(response);
            })
            .WithName("ShipOrder")
            .WithSummary("Mark order as shipped")
            .WithDescription("Change order status from Processing to Shipping.")
            .RequireAuthorization();
        }
    }
}