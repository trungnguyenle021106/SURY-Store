using Carter;
using Identity.Application.CQRS.Users.Commands.DeleteAddress;
using Mapster;
using MediatR;

namespace Identity.API.Endpoints.Users
{
    public record DeleteAddressResponse(bool IsSuccess);

    public class DeleteAddressEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/users/{userId}/addresses/{addressId}", async (Guid userId, Guid addressId, ISender sender) =>
            {
                var command = new DeleteAddressCommand(userId, addressId);

                var result = await sender.Send(command);

                var response = result.Adapt<DeleteAddressResponse>();

                return Results.Ok(response);
            })
            .WithName("DeleteAddress")
            .WithSummary("Delete user address")
            .WithDescription("Permanently remove a delivery address.");
        }
    }
}