using Carter;
using Identity.Application.CQRS.Users.Commands.CreateAddress;
using Identity.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Users
{
    public record CreateAddressRequest(
        string ReceiverName,
        string PhoneNumber,
        string Street,
        Wards Ward,
        bool IsDefault
    );

    public record CreateAddressResponse(Guid Id);

    public class CreateAddressEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/users/{userId}/addresses", async (Guid userId, [FromBody] CreateAddressRequest request, ISender sender) =>
            {
                var command = new CreateAddressCommand(
                    UserId: userId,
                    ReceiverName: request.ReceiverName,
                    PhoneNumber: request.PhoneNumber,
                    Street: request.Street,
                    Ward: request.Ward,
                    IsDefault: request.IsDefault
                );

                var result = await sender.Send(command);

                var response = result.Adapt<CreateAddressResponse>();

                return Results.Created($"/users/addresses/{response.Id}", response);
            })
            .WithName("CreateAddress")
            .WithSummary("Create new user address")
            .WithDescription("Add a new delivery address for the user.");
        }
    }
}