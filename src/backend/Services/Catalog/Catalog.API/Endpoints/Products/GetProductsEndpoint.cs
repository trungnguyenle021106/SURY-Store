using BuildingBlocks.Application.MediatR.CQRS;
using Carter;
using Catalog.Application.CQRS.Products.Queries.GetProduct;
using Catalog.Application.CQRS.Products.Queries.GetProduct.Catalog.Application.CQRS.Products.Queries.GetProduct;
using Catalog.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Products
{
    public record GetProductsResponse(PaginatedResult<ProductDto> Products);

    public record ProductDto(
        Guid Id,
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
            app.MapGet("/products", async (
                [FromQuery] int? pageNumber,
                [FromQuery] int? pageSize,
                [FromQuery] string? keyword,
                [FromQuery] Guid? categoryId,
                [FromQuery] Guid? excludeId,
                [FromQuery] bool? includeDrafts,
                [FromQuery] bool? bypassCache, // <--- 2. Nhận từ Query String
                ISender sender) =>
            {
                var query = new GetProductsQuery(
                    pageNumber ?? 1,
                    pageSize ?? 10,
                    keyword,
                    categoryId,
                    excludeId,
                    includeDrafts ?? false,
                    bypassCache ?? false // <--- 3. Truyền vào Query
                );

                var result = await sender.Send(query);
                var response = result.Adapt<GetProductsResponse>();
                return Results.Ok(response);
            });
        }
    }
}