using Catalog.Application.Common.Interfaces;
using Catalog.Application.CQRS.Products.Commands.CreateProduct;
using Catalog.Domain.Entities;
using Mapster;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;

namespace Catalog.Application.CQRS.Products.Commands.CreateBatchProducts
{
    public class CreateBatchProductsHandler : IRequestHandler<CreateBatchProductsCommand, CreateBatchProductsResult>
    {
        private readonly ICatalogDbContext _dbContext;
        private readonly IDistributedCache _cache; // Inject Cache
        private const string ProductMasterKey = "product-master-key";

        public CreateBatchProductsHandler(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<CreateBatchProductsResult> Handle(CreateBatchProductsCommand request, CancellationToken cancellationToken)
        {
            var products = request.Products.Adapt<List<Product>>();

            await _dbContext.Products.AddRangeAsync(products, cancellationToken);

            // Mapping kết quả trước
            var resultDtos = products.Adapt<List<CreateProductResult>>();

            // Xóa Cache Master Key
            await _cache.RemoveAsync(ProductMasterKey, cancellationToken);

            return new CreateBatchProductsResult(resultDtos);
        }
    }
}