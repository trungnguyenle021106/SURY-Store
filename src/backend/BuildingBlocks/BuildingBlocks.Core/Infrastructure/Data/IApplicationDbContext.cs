namespace BuildingBlocks.Core.Infrastructure.Data
{
    public interface IApplicationDbContext
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
