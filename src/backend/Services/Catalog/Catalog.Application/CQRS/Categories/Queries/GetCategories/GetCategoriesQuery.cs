using BuildingBlocks.Application.MediatR.CQRS;

namespace Catalog.Application.CQRS.Categories.Queries.GetCategories
{
    public record CategoryDto(Guid Id, string Name);

    public record GetCategoriesResult(PaginatedResult<CategoryDto> Categories);

    public record GetCategoriesQuery(
        int PageNumber = 1,
        int PageSize = 10,
        string? Keyword = null
    ) : IQuery<GetCategoriesResult>;
}