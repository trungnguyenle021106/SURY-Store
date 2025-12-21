using BuildingBlocks.Application.MediatR.CQRS;

namespace Catalog.Application.CQRS.Products.Commands.DiscontinueProduct
{
    public record DiscontinueProductResult(bool IsSuccess);

    public record DiscontinueProductCommand(Guid Id) : ICommand<DiscontinueProductResult>;
}