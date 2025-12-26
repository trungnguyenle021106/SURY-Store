using Carter;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.CQRS.Orders.Queries.GetOrderById;

namespace Ordering.API.Endpoints.Orders
{
    public record GetOrderByIdResponse(OrderDto Order);

    public class GetOrderByIdEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/orders/{id:guid}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new GetOrderByIdQuery(id));

                var response = result.Adapt<GetOrderByIdResponse>();

                return Results.Ok(response);
            })
            .WithName("GetOrderById")
            .WithSummary("Get order details by Id")
            .WithDescription("Returns full details of a specific order including items.");
        }
    }
}