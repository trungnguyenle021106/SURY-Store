using Carter;
using Identity.Application.CQRS.Commons.Queries.GetWards;
using Mapster;
using MediatR;

namespace Identity.API.Endpoints.Commons
{
    public record GetWardsResponse(IEnumerable<WardDto> Wards);

    public class GetWardsEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/commons/wards", async (ISender sender) =>
            {
                var query = new GetWardsQuery();

                var result = await sender.Send(query);

                var response = result.Adapt<GetWardsResponse>();

                return Results.Ok(response);
            })
            .WithName("GetWards")
            .WithSummary("Get list of wards")
            .WithDescription("Get all available wards with their keys and descriptions.")
            .AllowAnonymous(); 
        }
    }
}