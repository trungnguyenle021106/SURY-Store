using Catalog.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using System.Collections.Generic;

namespace Catalog.Application.CQRS.Products.Commands.ActivateProduct
{
    public class ActivateProductHandler : IRequestHandler<ActivateProductCommand, ActivateProductResult>
    {
        private readonly ICatalogDbContext _dbContext;
        private readonly IDistributedCache _cache; // Inject Cache
        private const string ProductMasterKey = "product-master-key";

        public ActivateProductHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<ActivateProductResult> Handle(ActivateProductCommand command, CancellationToken cancellationToken)
        {
            var product = await _dbContext.Products.FindAsync(command.Id, cancellationToken);

            if (product == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy sản phẩm với Id: {command.Id}");
            }

            product.Activate();

            _dbContext.Products.Update(product);

            // Xóa Cache Master Key
            await _cache.RemoveAsync(ProductMasterKey, cancellationToken);

            return new ActivateProductResult(true);
        }
    }
}