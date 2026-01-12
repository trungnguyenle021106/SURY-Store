using BuildingBlocks.Core.Exceptions;
using Catalog.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;

namespace Catalog.Application.CQRS.Products.Commands.UpdateProduct
{
    public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, UpdateProductResult>
    {
        private readonly ICatalogDbContext _dbContext;
        private readonly IDistributedCache _cache; // Inject Cache
        private const string ProductMasterKey = "product-master-key";

        public UpdateProductHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<UpdateProductResult> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
        {
            var product = await _dbContext.Products.FindAsync(command.Id, cancellationToken);

            if (product == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy sản phẩm với Id: {command.Id}");
            }

            product.UpdateDetails(
                command.Name,
                command.Price,
                command.Description,
                command.ImageUrl,
                command.CategoryId
            );

            _dbContext.Products.Update(product);

            // Xóa Cache Master Key
            await _cache.RemoveAsync(ProductMasterKey, cancellationToken);

            return new UpdateProductResult(true);
        }
    }
}