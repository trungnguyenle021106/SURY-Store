using BuildingBlocks.Core.Extensions;
using BuildingBlocks.Infrastructure.Extensions;
using Carter;
using Identity.API.Common.Models;
using Identity.Application.CQRS.Users.Queries.GetAddressById;
using Mapster;
using MediatR;
using System.Security.Claims;

namespace Identity.API.Endpoints.Users
{
    public class GetAddressByIdEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/users/addresses/{addressId}", async (Guid addressId, ClaimsPrincipal user, ISender sender) =>
            {
                var userId = user.GetUserId();

                var query = new GetAddressByIdQuery(userId, addressId);

                var result = await sender.Send(query);

                var response = result.Address.Adapt<UserAddressResponse>();

                return Results.Ok(response);
            })
            .WithName("GetAddressById")
            .WithSummary("Get address details")
            .WithDescription("Get detailed information of a specific address by its Id")
            .RequireAuthorization(); 
        }
    }
}