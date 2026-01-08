using BuildingBlocks.Application.Extensions; 
using BuildingBlocks.Application.MediatR.CQRS;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Common.Interfaces;
using Ordering.Domain.Entities;

namespace Ordering.Application.CQRS.Orders.Queries.GetOrdersByCustomer
{
    public class GetOrdersByCustomerHandler : IRequestHandler<GetOrdersByCustomerQuery, PaginatedResult<OrderCustomerDto>>
    {
        private readonly IOrderingDbContext _dbContext;

        public GetOrdersByCustomerHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PaginatedResult<OrderCustomerDto>> Handle(GetOrdersByCustomerQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.Orders
                        .AsNoTracking()
                        .Where(o => o.UserId == request.UserId); 

            if (request.Status.HasValue)
            {
                query = query.Where(o => o.Status == request.Status);
            }

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var search = request.SearchTerm.Trim().ToLower();
                query = query.Where(o =>
                    o.ShippingAddress.ReceiverName.ToLower().Contains(search) ||
                    o.Id.ToString().Contains(search));
            }

            query = query.OrderByDescending(o => o.OrderDate);

            return await query.ToPaginatedListAsync<Order, OrderCustomerDto>(
                request.PageNumber,
                request.PageSize,
                cancellationToken);
        }
    }
}