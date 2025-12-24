using BuildingBlocks.Application.MediatR.CQRS;

namespace Ordering.Application.CQRS.Orders.Commands.StartOrderProcessing
{
    public record StartOrderProcessingResult(bool IsSuccess);

    public record StartOrderProcessingCommand(Guid OrderId) : ICommand<StartOrderProcessingResult>;
}