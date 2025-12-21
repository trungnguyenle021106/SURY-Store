using BuildingBlocks.Application.MediatR.CQRS;
using Carter;
using Catalog.API.Commons.Models;
using Catalog.Application.CQRS.Categories.Queries.GetCategories;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Endpoints.Categories
{
    public record GetCategoriesResponse(PaginatedResult<CategoryResponse> Categories);

    public class GetCategoriesEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/categories", async (
                [FromQuery] int? pageNumber,
                [FromQuery] int? pageSize,
                [FromQuery] string? keyword,
                ISender sender) =>
            {
                var query = new GetCategoriesQuery(
                    pageNumber ?? 1,
                    pageSize ?? 10,
                    keyword
                );

                var result = await sender.Send(query);

                var response = result.Adapt<GetCategoriesResponse>();

                return Results.Ok(response);
            })
            .WithName("GetCategories")
            .WithSummary("Get paginated categories")
            .WithDescription("Get list of categories with pagination and search support.");
        }
    }
}