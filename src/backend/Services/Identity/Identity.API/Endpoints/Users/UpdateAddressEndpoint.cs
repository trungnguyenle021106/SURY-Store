using BuildingBlocks.Core.Extensions;
using Carter;
using Identity.Application.CQRS.Users.Commands.UpdateAddress;
using Identity.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; 
namespace Identity.API.Endpoints.Users

{
    public record UpdateAddressRequest(
        string ReceiverName,
        string PhoneNumber,
        string Street,
        Wards Ward,
        bool IsDefault
    );

    public record UpdateAddressResponse(bool IsSuccess);

    public class UpdateAddressEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/users/addresses/{addressId}", async (
                Guid addressId,
                ClaimsPrincipal user,
                [FromBody] UpdateAddressRequest request,
                ISender sender) =>
            {
                var userId = user.GetUserId();

                var command = new UpdateAddressCommand(
                    UserId: userId,
                    AddressId: addressId,
                    ReceiverName: request.ReceiverName,
                    PhoneNumber: request.PhoneNumber,
                    Street: request.Street,
                    Ward: request.Ward,
                    IsDefault: request.IsDefault
                );

                var result = await sender.Send(command);

                var response = result.Adapt<UpdateAddressResponse>();

                return Results.Ok(response);
            })
            .WithName("UpdateAddress")
            .WithSummary("Update existing address")
            .WithDescription("Update details of a specific delivery address for the current user.")
            .RequireAuthorization(); 
        }
    }
}