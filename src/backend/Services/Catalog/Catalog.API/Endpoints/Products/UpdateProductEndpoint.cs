using Carter;
using Catalog.Application.CQRS.Products.Commands.UpdateProduct;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Products
{
    public record UpdateProductRequest(
        string Name,
        decimal Price,
        string Description,
        string ImageUrl,
        Guid CategoryId
    );

    public record UpdateProductResponse(bool IsSuccess);

    public class UpdateProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/products/{id}", async (Guid id, [FromBody] UpdateProductRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = request.Adapt<UpdateProductCommand>() with { Id = id };

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<UpdateProductResponse>();

                return Results.Ok(response);
            })
            .WithName("UpdateProduct")
            .WithSummary("Update a product")
            .WithDescription("Update an existing product in the catalog")
            .RequireAuthorization("AdminOnly");
        }
    }
}