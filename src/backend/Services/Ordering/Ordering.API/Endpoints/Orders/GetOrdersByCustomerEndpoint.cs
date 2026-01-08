using BuildingBlocks.Infrastructure.Extensions; 
using Carter;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.CQRS.Orders.Queries.GetOrdersByCustomer;
using Ordering.Domain.Enums;
using System.Security.Claims;

namespace Ordering.API.Endpoints.Orders
{
    public class GetOrdersByCustomerEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/orders/me", async (
                [FromQuery] int? pageNumber,
                [FromQuery] int? pageSize,
                [FromQuery] OrderStatus? status,
                [FromQuery] string? searchTerm,
                ISender sender,
                ClaimsPrincipal user) =>
            {
                var userId = user.GetUserId();

                if (userId == Guid.Empty)
                {
                    return Results.Unauthorized();
                }

                var query = new GetOrdersByCustomerQuery(
                    userId,
                    pageNumber ?? 1,
                    pageSize ?? 10,
                    status,
                    searchTerm);

                var result = await sender.Send(query);

                return Results.Ok(result);
            })
            .WithName("GetOrdersByCustomer")
            .WithSummary("Get my orders")
            .WithDescription("Get paginated orders for the logged-in user.")
            .RequireAuthorization();
        }
    }
}