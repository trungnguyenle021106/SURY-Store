using Carter;
using Mapster;
using MediatR;
using Ordering.Application.CQRS.Orders.Queries.GetOrdersByUserId;

namespace Ordering.API.Endpoints.Orders
{
    public record GetOrdersByUserIdResponse(IEnumerable<OrderDto> Orders);

    public class GetOrdersByUserIdEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/orders/user/{userId:guid}", async (Guid userId, ISender sender) =>
            {
                var result = await sender.Send(new GetOrdersByUserIdQuery(userId));

                var response = result.Adapt<GetOrdersByUserIdResponse>();

                return Results.Ok(response);
            })
            .WithName("GetOrdersByUserId")
            .WithSummary("Get order history by user")
            .WithDescription("Returns a list of all orders placed by a specific user.");
        }
    }
}