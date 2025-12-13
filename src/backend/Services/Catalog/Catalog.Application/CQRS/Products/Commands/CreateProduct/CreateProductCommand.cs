using BuildingBlocks.Core.CQRS;
using Catalog.Domain.Enums;

namespace Catalog.Application.CQRS.Products.Commands.CreateProduct
{
    public record CreateProductResult(
            Guid Id,           
            string Name,
            decimal Price,
            string Description,
            string ImageUrl,
            ProductStatus Status,
            int Quantity,
            Guid CategoryId
        );

    public record CreateProductCommand(
            string name,
            decimal price,
            string description,
            string imageUrl,
            Guid categoryId
        ) : ICommand<CreateProductResult>;
}
