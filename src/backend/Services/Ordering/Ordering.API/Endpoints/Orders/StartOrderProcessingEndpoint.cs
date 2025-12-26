using Carter;
using Mapster;
using MediatR;
using Ordering.Application.CQRS.Orders.Commands.StartOrderProcessing;

namespace Ordering.API.Endpoints.Orders
{
    public record StartOrderProcessingResponse(bool IsSuccess);

    public class StartOrderProcessingEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPatch("/orders/{id}/start-processing", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new StartOrderProcessingCommand(id));

                var response = result.Adapt<StartOrderProcessingResponse>();

                return Results.Ok(response);
            })
            .WithName("StartOrderProcessing")
            .WithSummary("Start processing an order")
            .WithDescription("Change order status from Pending to Processing.")
            .RequireAuthorization();
        }
    }
}