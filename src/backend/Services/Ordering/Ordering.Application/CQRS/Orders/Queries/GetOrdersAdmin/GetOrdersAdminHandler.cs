using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Application.MediatR.CQRS;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Common.Interfaces;
using Ordering.Domain.Entities;

namespace Ordering.Application.CQRS.Orders.Queries.GetOrdersAdmin
{
    public class GetOrdersAdminHandler : IRequestHandler<GetOrdersAdminQuery, PaginatedResult<OrderAdminDto>>
    {
        private readonly IOrderingDbContext _dbContext;

        public GetOrdersAdminHandler(IOrderingDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PaginatedResult<OrderAdminDto>> Handle(GetOrdersAdminQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.Orders.AsNoTracking();

            if (request.Status.HasValue)
            {
                query = query.Where(o => o.Status == request.Status);
            }

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var search = request.SearchTerm.Trim().ToLower();
                query = query.Where(o =>
                    o.ShippingAddress.ReceiverName.ToLower().Contains(search) ||
                    o.ShippingAddress.PhoneNumber.Contains(search) ||
                    o.Id.ToString().Contains(search)); 
            }

            query = query.OrderByDescending(o => o.OrderDate);
      
            return await query.ToPaginatedListAsync<Order, OrderAdminDto>(
                request.PageNumber,
                request.PageSize,
                cancellationToken);
        }
    }
}