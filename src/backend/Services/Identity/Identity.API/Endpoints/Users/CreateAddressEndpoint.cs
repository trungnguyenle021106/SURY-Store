using BuildingBlocks.Core.Enums;
using BuildingBlocks.Infrastructure.Extensions;
using Carter;
using Identity.Application.CQRS.Users.Commands.CreateAddress;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
            app.MapPost("/users/addresses", async (ClaimsPrincipal user, [FromBody] CreateAddressRequest request, ISender sender) =>
            {
                var userId = user.GetUserId();

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
            .WithDescription("Add a new delivery address for the current user.")
            .RequireAuthorization(); 
        }
    }
}