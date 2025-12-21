using BuildingBlocks.Application.MediatR.CQRS;

namespace Catalog.Application.CQRS.Products.Commands.ActivateProduct
{
    public record ActivateProductResult(bool IsSuccess);

    public record ActivateProductCommand(Guid Id) : ICommand<ActivateProductResult>;
}