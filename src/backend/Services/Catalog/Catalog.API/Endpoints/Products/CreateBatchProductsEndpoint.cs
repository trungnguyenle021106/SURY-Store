using Carter;
using Catalog.Application.CQRS.Products.Commands.CreateBatchProducts;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Products
{
    public class CreateBatchProductsEndpoint : ICarterModule
    {
        private record CreateBatchProductDto(
          string Name,
          decimal Price,
          string Description,
          string ImageUrl,
          Guid CategoryId
        );
        private record CreateBatchProductsRequest(List<CreateBatchProductDto> Products);

        private record CreateBatchProductsResponse(List<CreateProductResponse> Products);

        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/products/batch", async ([FromBody] CreateBatchProductsRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = request.Adapt<CreateBatchProductsCommand>();

                var result = await sender.Send(command, cancellationToken);
                var response = result.Adapt<CreateBatchProductsResponse>();

                return Results.Created("/products/batch", response);
            })
            .WithName("CreateBatchProducts")
            .WithSummary("Create multiple products")
            .WithDescription("Create a batch of new products into the catalog")
            .RequireAuthorization();
        }
    }
}