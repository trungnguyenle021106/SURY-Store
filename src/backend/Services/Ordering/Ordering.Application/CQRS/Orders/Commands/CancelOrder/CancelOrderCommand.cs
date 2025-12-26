using BuildingBlocks.Application.MediatR.CQRS;

namespace Ordering.Application.CQRS.Orders.Commands.CancelOrder
{
    public record CancelOrderResult(bool IsSuccess);

    public record CancelOrderCommand(Guid OrderId) : ICommand<CancelOrderResult>;
}