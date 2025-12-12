using Catalog.Application.Data;
using MediatR;

namespace Catalog.Application.CQRS.Products.Queries.GetProduct
{
    public class GetProductsHandler
         : IRequestHandler<GetProductsQuery, GetProductsResult>
    {
        private readonly IProductRepository _repository;

        public GetProductsHandler(IProductRepository productRepository)
        {
            this._repository = productRepository;
        }

        public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
        {
            var products = (await _repository.GetAllAsync());
            return new GetProductsResult(products);
        }
    }
}
