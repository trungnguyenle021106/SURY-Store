using BuildingBlocks.Infrastructure.Extensions;
using Carter;
using Mapster;
using MediatR;
using Ordering.Application.CQRS.Orders.Queries.GetOrdersByUserId;
using System.Security.Claims; 

namespace Ordering.API.Endpoints.Orders
{
    public record GetOrdersByUserIdResponse(IEnumerable<OrderDto> Orders);

    public class GetOrdersByUserIdEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/orders/user/{userId:guid}", async (Guid userId, ClaimsPrincipal user, ISender sender) =>
            {
                var currentUserId = user.GetUserId();
                var isAdmin = user.IsInRole("Admin");

                var query = new GetOrdersByUserIdQuery(userId, currentUserId, isAdmin);

                var result = await sender.Send(query);

                var response = result.Adapt<GetOrdersByUserIdResponse>();

                return Results.Ok(response);
            })
            .WithName("GetOrdersByUserId")
            .WithSummary("Get order history by user")
            .WithDescription("Returns a list of all orders placed by a specific user.")
            .RequireAuthorization(); 
        }
    }
}