using BuildingBlocks.Infrastructure.Extensions;
using Carter;
using Mapster;
using MediatR;
using Ordering.Application.CQRS.Orders.Queries.GetOrderById;
using System.Security.Claims;

namespace Ordering.API.Endpoints.Orders
{
    public record GetOrderByIdResponse(OrderDto Order);

    public class GetOrderByIdEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/orders/{id}", async (Guid id, ClaimsPrincipal user, ISender sender) =>
            {
                var userId = user.GetUserId();

                var isAdmin = user.IsInRole("Admin");

                var query = new GetOrderByIdQuery(id, userId, isAdmin);

                var result = await sender.Send(query);

                var response = result.Adapt<GetOrderByIdResponse>();

                return Results.Ok(response);
            })
            .WithName("GetOrderById")
            .WithSummary("Get order details by Id")
            .WithDescription("Returns full details of a specific order including items.")
            .RequireAuthorization(); 
        }
    }
}