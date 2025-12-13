using Catalog.Application.Common.Interfaces;
using Catalog.Domain.Entities;
using MediatR;

namespace Catalog.Application.CQRS.Products.Commands.CreateProduct
{
    public class CreateProductHandler : IRequestHandler<CreateProductCommand, CreateProductResult>
    {
        private readonly ICatalogDbContext _dbContext;

        public CreateProductHandler(ICatalogDbContext _dbContext)
        {
            this._dbContext = _dbContext;
        }

        public async Task<CreateProductResult> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            Product product = new Product(request.name, request.price, request.description, request.imageUrl, request.categoryId);
            await this._dbContext.Products.AddAsync(product);

            return new CreateProductResult(
                    product.Id, 
                    product.Name,
                    product.Price, 
                    product.Description, 
                    product.ImageUrl, 
                    product.Status, 
                    product.Quantity, 
                    product.CategoryId
                );
        }
    }
}
