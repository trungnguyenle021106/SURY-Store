using Carter;
using Identity.Application.CQRS.Users.Commands.SetDefaultAddress;
using Mapster;
using MediatR;

namespace Identity.API.Endpoints.Users
{
    public record SetDefaultAddressResponse(bool IsSuccess);

    public class SetDefaultAddressEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/users/{userId}/addresses/{addressId}/set-default", async (Guid userId, Guid addressId, ISender sender) =>
            {
                var command = new SetDefaultAddressCommand(userId, addressId);

                var result = await sender.Send(command);

                var response = result.Adapt<SetDefaultAddressResponse>();

                return Results.Ok(response);
            })
            .WithName("SetDefaultAddress")
            .WithSummary("Set address as default")
            .WithDescription("Set a specific address as the default delivery address for the user.");
        }
    }
}