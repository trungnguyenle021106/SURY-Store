using BuildingBlocks.Application.Extensions;
using Catalog.Application.Common.Interfaces;
using Catalog.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.CQRS.Products.Queries.GetProduct
{
    public class GetProductsHandler : IRequestHandler<GetProductsQuery, GetProductsResult>
    {
        private readonly ICatalogDbContext _dbContext;

        public GetProductsHandler(ICatalogDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
        {
            var productsQuery = _dbContext.Products
                .AsNoTracking(); 

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var keyword = query.Keyword.Trim(); 

                productsQuery = productsQuery.Where(p =>
                    p.Name.Contains(keyword) ||
                    p.Description.Contains(keyword));
            }
            var paginatedProducts = await productsQuery
                .OrderBy(p => p.Name)
                .ToPaginatedListAsync<Product, ProductDto>(
                    query.PageNumber,
                    query.PageSize,
                    cancellationToken
                );

            return new GetProductsResult(paginatedProducts);
        }
    }
}