using BuildingBlocks.Application.MediatR.CQRS;

namespace Ordering.Application.CQRS.Orders.Commands.ShipOrder
{
    public record ShipOrderResult(bool IsSuccess);

    public record ShipOrderCommand(Guid OrderId) : ICommand<ShipOrderResult>;
}