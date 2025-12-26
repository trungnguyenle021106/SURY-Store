using MediatR;
using Ordering.Application.Common.Interfaces;

namespace Ordering.Application.CQRS.Orders.Commands.CancelOrder
{
    public class CancelOrderHandler : IRequestHandler<CancelOrderCommand, CancelOrderResult>
    {
        private readonly IOrderingDbContext _dbContext;

        public CancelOrderHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CancelOrderResult> Handle(CancelOrderCommand command, CancellationToken cancellationToken)
        {
            var order = await _dbContext.Orders
                .FindAsync(command.OrderId, cancellationToken);

            if (order == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng: {command.OrderId}");
            }

            order.CancelOrder();

            _dbContext.Orders.Update(order);

            return new CancelOrderResult(true);
        }
    }
}