using Catalog.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Caching.Distributed; // Cần thêm namespace này

namespace Catalog.Application.CQRS.Products.Commands.RemoveProductStock
{
    public class RemoveProductStockHandler : IRequestHandler<RemoveProductStockCommand, RemoveProductStockResult>
    {
        private readonly ICatalogDbContext _dbContext;
        private readonly IDistributedCache _cache; // Inject thêm Cache
        private const string ProductMasterKey = "product-master-key";

        public RemoveProductStockHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<RemoveProductStockResult> Handle(RemoveProductStockCommand command, CancellationToken cancellationToken)
        {
            var product = await _dbContext.Products.FindAsync(command.Id, cancellationToken);

            if (product == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy sản phẩm với Id: {command.Id}");
            }

            product.RemoveStock(command.Quantity);

            _dbContext.Products.Update(product);

            // Xóa Master Key
            await _cache.RemoveAsync(ProductMasterKey, cancellationToken);

            return new RemoveProductStockResult(true);
        }
    }
}