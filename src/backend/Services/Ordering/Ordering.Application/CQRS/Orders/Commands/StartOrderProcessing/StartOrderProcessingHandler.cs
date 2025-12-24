using MediatR;
using Ordering.Application.Common.Interfaces;

namespace Ordering.Application.CQRS.Orders.Commands.StartOrderProcessing
{
    public class StartOrderProcessingHandler : IRequestHandler<StartOrderProcessingCommand, StartOrderProcessingResult>
    {
        private readonly IOrderingDbContext _dbContext;

        public StartOrderProcessingHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<StartOrderProcessingResult> Handle(StartOrderProcessingCommand command, CancellationToken cancellationToken)
        {
            var order = await _dbContext.Orders
                .FindAsync(command.OrderId, cancellationToken);

            if (order == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng với Id: {command.OrderId}");
            }

            order.StartProcessing();

            _dbContext.Orders.Update(order);

            return new StartOrderProcessingResult(true);
        }
    }
}