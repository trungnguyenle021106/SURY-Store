using Carter;
using Catalog.Application.CQRS.Products.Commands.AddProductStock;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Products
{
    public record AddProductStockRequest(int Quantity);

    public record AddProductStockResponse(bool IsSuccess);

    public class AddProductStockEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/products/{id}/stock", async (Guid id, [FromBody] AddProductStockRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = new AddProductStockCommand(id, request.Quantity);

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<AddProductStockResponse>();

                return Results.Ok(response);
            })
            .WithName("AddProductStock")
            .WithSummary("Add stock to product")
            .WithDescription("Increase the quantity of a product inside the catalog")
            .RequireAuthorization("AdminOnly");
        }
    }
}