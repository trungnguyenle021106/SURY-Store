using BuildingBlocks.Application.MediatR.CQRS;

namespace Catalog.Application.CQRS.Products.Commands.UpdateProduct
{
    public record UpdateProductResult(bool IsSuccess);

    public record UpdateProductCommand(
        Guid Id,
        string Name,
        decimal Price,
        string Description,
        string ImageUrl,
        Guid CategoryId
    ) : ICommand<UpdateProductResult>;
}