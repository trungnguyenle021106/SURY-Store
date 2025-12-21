using BuildingBlocks.Application.MediatR.CQRS;
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
        string Name,
        decimal Price,
        string Description,
        string ImageUrl,
        Guid CategoryId
    ) : ICommand<CreateProductResult>;
}
