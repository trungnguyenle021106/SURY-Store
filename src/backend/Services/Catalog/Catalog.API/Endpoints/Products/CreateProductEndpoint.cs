using Carter;
using Catalog.Application.CQRS.Products.Commands.CreateProduct;
using Catalog.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Products
{
    public record CreateProductRequest(
        string Name,
        decimal Price,
        string Description,
        string ImageUrl,
        Guid CategoryId
    );

    public record CreateProductResponse(
        Guid Id,
        string Name,
        decimal Price,
        string Description,
        string ImageUrl,
        ProductStatus Status,
        int Quantity,
        Guid CategoryId
    );

    public class CreateProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/products", async ([FromBody] CreateProductRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = request.Adapt<CreateProductCommand>();           

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<CreateProductResponse>();

                return Results.Created($"/products/{response.Id}", response);
            })
            .WithName("CreateProduct")
            .WithSummary("Create a new product")
            .WithDescription("Create a new product into the catalog")
            .RequireAuthorization("AdminOnly");
        }
    }
}