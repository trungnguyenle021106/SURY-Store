using BuildingBlocks.Application.Data;
using Ordering.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace Ordering.Application.Common.Interfaces
{
    public interface IOrderingDbContext : IApplicationDbContext
    {
        DbSet<Order> Orders { get; }
        DbSet<OrderItem> OrderItems { get; }
    }
}
