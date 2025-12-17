using Carter;
using Identity.API.Common.Models;
using Identity.Application.CQRS.Users.Queries.GetUserAddresses;
using Mapster;
using MediatR;

namespace Identity.API.Endpoints.Users
{
    public record GetUserAddressesResponse(IEnumerable<UserAddressResponse> Addresses);

    public class GetUserAddressesEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/users/{userId}/addresses", async (Guid userId, ISender sender) =>
            {
                var query = new GetUserAddressesQuery(userId);

                var result = await sender.Send(query);

                var response = result.Adapt<GetUserAddressesResponse>();

                return Results.Ok(response);
            })
            .WithName("GetUserAddresses")
            .WithSummary("Get user addresses")
            .WithDescription("Get list of delivery addresses for a specific user");
        }
    }
}