using Carter;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.CQRS.Orders.Queries.GetOrdersAdmin;
using Ordering.Domain.Enums;

namespace Ordering.API.Endpoints.Orders
{
    public class GetOrdersAdminEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/admin/orders", async (
                [FromQuery] int? pageNumber,
                [FromQuery] int? pageSize,
                [FromQuery] OrderStatus? status,
                [FromQuery] string? searchTerm,
                ISender sender) =>
            {
                var query = new GetOrdersAdminQuery(
                    pageNumber ?? 1,
                    pageSize ?? 10,
                    status,
                    searchTerm);

                var result = await sender.Send(query);

                return Results.Ok(result);
            })
            .WithName("GetOrdersAdmin")
            .WithSummary("Get paginated orders for Admin")
            .WithDescription("Allows admin to filter orders by status and search by name/phone with pagination.");
        }
    }
}