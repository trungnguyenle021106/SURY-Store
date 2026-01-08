using Carter;
using Catalog.Application.CQRS.Categories.Commands.UpdateCategory;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Categories
{
    public record UpdateCategoryRequest(string Name);

    public record UpdateCategoryResponse(bool IsSuccess);

    public class UpdateCategoryEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/categories/{id}", async (Guid id, [FromBody] UpdateCategoryRequest request, ISender sender) =>
            {
                var command = new UpdateCategoryCommand(id, request.Name);

                var result = await sender.Send(command);

                var response = result.Adapt<UpdateCategoryResponse>();

                return Results.Ok(response);
            })
            .WithName("UpdateCategory")
            .WithSummary("Update category")
            .WithDescription("Update the name of an existing category.")
            .RequireAuthorization("AdminOnly");
        }
    }
}