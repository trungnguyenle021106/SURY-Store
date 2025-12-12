using Carter;
using Catalog.Application.CQRS.Products.Commands.CreateProduct;
using Catalog.Domain.Enums;
using MediatR;

namespace Catalog.API.Endpoints.Products
{
    public record GetProductsResponse(IEnumerable<ProductDto> Products);
    public record ProductDto(Guid Id,
            string Name,
            decimal Price,
            string Description,
            string ImageUrl,
            ProductStatus Status,
            int Quantity,
            Guid CategoryId);

    public class GetProductsEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/products", async (ISender sender) =>
            {
                var result = await sender.Send(new GetProductsQuery());

                // Map từ Result (Entity) sang Response (DTO)
                // Mapster đủ thông minh để map list sang list
                var response = result.Adapt<GetProductsResponse>();

                return Results.Ok(response);
            })
            .WithName("GetProducts")
            .WithSummary("Get products")
            .WithDescription("Get products list");
        }
    }
}
