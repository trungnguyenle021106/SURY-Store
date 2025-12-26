using MediatR;
using Ordering.Application.Common.Interfaces;

namespace Ordering.Application.CQRS.Orders.Commands.CompleteOrder
{
    public class CompleteOrderHandler : IRequestHandler<CompleteOrderCommand, CompleteOrderResult>
    {
        private readonly IOrderingDbContext _dbContext;

        public CompleteOrderHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CompleteOrderResult> Handle(CompleteOrderCommand command, CancellationToken cancellationToken)
        {
            var order = await _dbContext.Orders
                .FindAsync(command.OrderId, cancellationToken);

            if (order == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng: {command.OrderId}");
            }
            order.CompleteOrder();

            _dbContext.Orders.Update(order);

            return new CompleteOrderResult(true);
        }
    }
}