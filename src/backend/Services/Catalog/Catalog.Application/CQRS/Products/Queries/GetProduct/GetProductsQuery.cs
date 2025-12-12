using BuildingBlocks.Core.CQRS;
using Catalog.Domain.Entities;

namespace Catalog.Application.CQRS.Products.Queries.GetProduct
{
    public record GetProductsResult(IEnumerable<Product> Products);
    public record GetProductsQuery() : IQuery<GetProductsResult>;
}
