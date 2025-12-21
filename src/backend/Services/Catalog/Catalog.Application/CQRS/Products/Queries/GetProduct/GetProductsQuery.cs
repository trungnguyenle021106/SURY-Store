using BuildingBlocks.Application.MediatR.CQRS;
using Catalog.Domain.Enums;

namespace Catalog.Application.CQRS.Products.Queries.GetProduct
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public decimal Price { get; set; }
        public string Description { get; set; } = default!;
        public string ImageUrl { get; set; } = default!;
        public ProductStatus Status { get; set; }
        public int Quantity { get; set; }
        public Guid CategoryId { get; set; }
    }

    public record GetProductsResult(PaginatedResult<ProductDto> Products);

    public record GetProductsQuery(
        int PageNumber = 1,
        int PageSize = 10,
        string? Keyword = null
    ) : IQuery<GetProductsResult>;
}