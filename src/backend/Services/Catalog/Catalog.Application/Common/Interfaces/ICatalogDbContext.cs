using BuildingBlocks.Application.Data;
using Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace Catalog.Application.Common.Interfaces
{
    public interface ICatalogDbContext : IApplicationDbContext
    {
        DbSet<Product> Products { get; }
        DbSet<Category> Categories { get; }
    }
}
