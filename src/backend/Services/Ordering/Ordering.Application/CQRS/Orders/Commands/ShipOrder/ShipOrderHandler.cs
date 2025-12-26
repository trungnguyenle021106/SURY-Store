using MediatR;
using Ordering.Application.Common.Interfaces;

namespace Ordering.Application.CQRS.Orders.Commands.ShipOrder
{
    public class ShipOrderHandler : IRequestHandler<ShipOrderCommand, ShipOrderResult>
    {
        private readonly IOrderingDbContext _dbContext;

        public ShipOrderHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ShipOrderResult> Handle(ShipOrderCommand command, CancellationToken cancellationToken)
        {
            var order = await _dbContext.Orders
                .FindAsync(command.OrderId, cancellationToken);

            if (order == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng với Id: {command.OrderId}");
            }

            order.MarkAsShipped();

            _dbContext.Orders.Update(order);

            return new ShipOrderResult(true);
        }
    }
}