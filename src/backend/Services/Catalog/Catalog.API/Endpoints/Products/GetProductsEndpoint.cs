using BuildingBlocks.Application.MediatR.CQRS;
using Carter;
using Catalog.Application.CQRS.Products.Queries.GetProduct;
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
                [FromQuery] bool? includeDrafts, // <--- 1. Thêm tham số này (mặc định null/false)
                ISender sender) =>
            {
                var query = new GetProductsQuery(
                    pageNumber ?? 1,
                    pageSize ?? 10,
                    keyword,
                    categoryId,
                    excludeId,
                    includeDrafts ?? false // <--- 2. Truyền vào Query
                );

                var result = await sender.Send(query);

                var response = result.Adapt<GetProductsResponse>();

                return Results.Ok(response);
            })
            .WithName("GetProducts")
            .WithSummary("Get paginated products with search and filter")
            .WithDescription("Get products list with pagination, search, category filter, exclusion support and draft inclusion option");
        }
    }
}