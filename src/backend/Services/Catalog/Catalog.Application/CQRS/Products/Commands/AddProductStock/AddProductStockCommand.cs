using BuildingBlocks.Application.MediatR.CQRS;

namespace Catalog.Application.CQRS.Products.Commands.AddProductStock
{
    public record AddProductStockResult(bool IsSuccess);

    public record AddProductStockCommand(Guid Id, int Quantity)
        : ICommand<AddProductStockResult>;
}