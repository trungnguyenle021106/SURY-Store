using BuildingBlocks.Application.MediatR.CQRS;

namespace Ordering.Application.CQRS.Orders.Commands.CompleteOrder
{
    public record CompleteOrderResult(bool IsSuccess);

    public record CompleteOrderCommand(Guid OrderId) : ICommand<CompleteOrderResult>;
}