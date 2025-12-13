using Catalog.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.CQRS.Products.Queries.GetProduct
{
    public class GetProductsHandler
         : IRequestHandler<GetProductsQuery, GetProductsResult>
    {
        private readonly ICatalogDbContext _dbContext;

        public GetProductsHandler(ICatalogDbContext _dbContext)
        {
            this._dbContext = _dbContext;
        }

        public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
        {
            var products = await _dbContext.Products.AsNoTracking().ToListAsync(cancellationToken);
            return new GetProductsResult(products);
        }
    }
}
