using Carter;
using Mapster;
using MediatR;
using Ordering.Application.CQRS.Orders.Commands.CompleteOrder;

namespace Ordering.API.Endpoints.Orders
{
    public record CompleteOrderResponse(bool IsSuccess);

    public class CompleteOrderEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPatch("/orders/{id}/complete", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new CompleteOrderCommand(id));

                var response = result.Adapt<CompleteOrderResponse>();

                return Results.Ok(response);
            })
            .WithName("CompleteOrder")
            .WithSummary("Mark order as completed")
            .WithDescription("Change order status from Shipping to Completed.");
        }
    }
}