using Microsoft.EntityFrameworkCore.Storage;

namespace BuildingBlocks.Application.Data
{
    public interface IApplicationDbContext
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}
