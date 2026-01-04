using Catalog.Application.Common.Interfaces;
using Catalog.Domain.Entities;
using Catalog.Application.CQRS.Products.Commands.CreateProduct;
using Mapster;
using MediatR;

namespace Catalog.Application.CQRS.Products.Commands.CreateBatchProducts
{
    public class CreateBatchProductsHandler : IRequestHandler<CreateBatchProductsCommand, CreateBatchProductsResult>
    {
        private readonly ICatalogDbContext _dbContext;

        public CreateBatchProductsHandler(ICatalogDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CreateBatchProductsResult> Handle(CreateBatchProductsCommand request, CancellationToken cancellationToken)
        {
            var products = request.Products.Adapt<List<Product>>();

            await _dbContext.Products.AddRangeAsync(products, cancellationToken);

            var resultDtos = products.Adapt<List<CreateProductResult>>();

            return new CreateBatchProductsResult(resultDtos);
        }
    }
}