using BuildingBlocks.Application.MediatR.CQRS;

namespace Catalog.Application.CQRS.Categories.Commands.UpdateCategory
{
    public record UpdateCategoryResult(bool IsSuccess);

    public record UpdateCategoryCommand(Guid Id, string Name) : ICommand<UpdateCategoryResult>;
}