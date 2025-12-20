using BuildingBlocks.Core.Extensions;
using Carter;
using Identity.Application.CQRS.Users.Commands.DeleteAddress;
using Mapster;
using MediatR;
using System.Security.Claims;

namespace Identity.API.Endpoints.Users
{
    public record DeleteAddressResponse(bool IsSuccess);

    public class DeleteAddressEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/users/addresses/{addressId}", async (Guid addressId, ClaimsPrincipal user, ISender sender) =>
            {
                var userId = user.GetUserId();

                var command = new DeleteAddressCommand(userId, addressId);

                var result = await sender.Send(command);

                var response = result.Adapt<DeleteAddressResponse>();

                return Results.Ok(response);
            })
            .WithName("DeleteAddress")
            .WithSummary("Delete user address")
            .WithDescription("Permanently remove a delivery address.")
            .RequireAuthorization();
        }
    }
}