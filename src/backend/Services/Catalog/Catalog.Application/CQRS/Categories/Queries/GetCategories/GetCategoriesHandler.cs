using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Core.Extensions;
using Catalog.Application.Common.Interfaces;
using Catalog.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.CQRS.Categories.Queries.GetCategories
{
    public class GetCategoriesHandler : IRequestHandler<GetCategoriesQuery, GetCategoriesResult>
    {
        private readonly ICatalogDbContext _dbContext;

        public GetCategoriesHandler(ICatalogDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<GetCategoriesResult> Handle(GetCategoriesQuery query, CancellationToken cancellationToken)
        {
            var categoriesQuery = _dbContext.Categories.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var keyword = query.Keyword.Trim();
                categoriesQuery = categoriesQuery.Where(c => c.Name.Contains(keyword));
            }

            var paginatedCategories = await categoriesQuery
                .OrderBy(c => c.Name)
                .ToPaginatedListAsync<Category, CategoryDto>(
                    query.PageNumber,
                    query.PageSize,
                    cancellationToken
                );

            return new GetCategoriesResult(paginatedCategories);
        }
    }
}