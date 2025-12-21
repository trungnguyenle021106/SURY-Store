using BuildingBlocks.Application.MediatR.CQRS;

namespace Catalog.Application.CQRS.Categories.Queries.GetCategoryById
{
    public record CategoryDto(Guid Id, string Name);

    public record GetCategoryByIdResult(CategoryDto Category);

    public record GetCategoryByIdQuery(Guid Id) : IQuery<GetCategoryByIdResult>;
}