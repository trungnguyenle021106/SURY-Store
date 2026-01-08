using Carter;
using Catalog.Application.CQRS.Categories.Commands.CreateCategory;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Categories
{
    public record CreateCategoryRequest(string Name);

    public record CreateCategoryResponse(Guid Id);

    public class CreateCategoryEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/categories", async ([FromBody] CreateCategoryRequest request, ISender sender) =>
            {
                var command = request.Adapt<CreateCategoryCommand>();

                var result = await sender.Send(command);

                var response = result.Adapt<CreateCategoryResponse>();

                return Results.Created($"/categories/{response.Id}", response);
            })
            .WithName("CreateCategory")
            .WithSummary("Create new category")
            .WithDescription("Create a new product category.")
            .RequireAuthorization("AdminOnly");
        }
    }
}