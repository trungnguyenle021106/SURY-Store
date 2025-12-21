using BuildingBlocks.Application.MediatR.CQRS;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace BuildingBlocks.Application.Extensions
{
    public static class PaginationExtensions
    {
        public static async Task<PaginatedResult<TDestination>> ToPaginatedListAsync<TEntity, TDestination>(
            this IQueryable<TEntity> queryable,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default)
            where TDestination : class
        {
            var count = await queryable.LongCountAsync(cancellationToken);

            var items = await queryable
                .ProjectToType<TDestination>()
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PaginatedResult<TDestination>(pageNumber, pageSize, count, items);
        }
    }
}
