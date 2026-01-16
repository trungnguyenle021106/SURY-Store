using Catalog.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;

namespace Catalog.Application.CQRS.Products.Commands.AddProductStock
{
    public class AddProductStockHandler : IRequestHandler<AddProductStockCommand, AddProductStockResult>
    {
        private readonly ICatalogDbContext _dbContext;
        private readonly IDistributedCache _cache;
        private const string ProductMasterKey = "product-master-key"; // Key tổng

        public AddProductStockHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<AddProductStockResult> Handle(AddProductStockCommand command, CancellationToken cancellationToken)
        {
            var product = await _dbContext.Products.FindAsync(command.Id, cancellationToken);

            if (product == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy sản phẩm với Id: {command.Id}");
            }

            product.AddStock(command.Quantity);

            _dbContext.Products.Update(product);

            // Xóa Master Key để API GetProducts biết đường load lại dữ liệu mới
            await _cache.RemoveAsync(ProductMasterKey, cancellationToken);

            return new AddProductStockResult(true);
        }
    }
}