using Catalog.Application.Common.Interfaces;
using Catalog.Domain.Entities;
using Mapster;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;

namespace Catalog.Application.CQRS.Products.Commands.CreateProduct
{
    public class CreateProductHandler : IRequestHandler<CreateProductCommand, CreateProductResult>
    {
        private readonly ICatalogDbContext _dbContext;
        private readonly IDistributedCache _cache; // Inject Cache
        private const string ProductMasterKey = "product-master-key";

        public CreateProductHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<CreateProductResult> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            var product = request.Adapt<Product>();

            await _dbContext.Products.AddAsync(product, cancellationToken);

            // Xóa Cache Master Key
            await _cache.RemoveAsync(ProductMasterKey, cancellationToken);

            return product.Adapt<CreateProductResult>();
        }
    }
}
