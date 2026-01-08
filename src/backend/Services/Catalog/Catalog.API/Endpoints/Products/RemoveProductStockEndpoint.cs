using Carter;
using Catalog.Application.CQRS.Products.Commands.RemoveProductStock;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Products
{
    public record RemoveProductStockRequest(int Quantity);

    public record RemoveProductStockResponse(bool IsSuccess);

    public class RemoveProductStockEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/products/{id}/stock/remove", async (Guid id, [FromBody] RemoveProductStockRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = request.Adapt<RemoveProductStockCommand>() with { Id = id };

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<RemoveProductStockResponse>();

                return Results.Ok(response);
            })
            .WithName("RemoveProductStock")
            .WithSummary("Remove stock from product")
            .WithDescription("Decrease the quantity of a product inside the catalog")
            .RequireAuthorization("AdminOnly");
        }
    }
}