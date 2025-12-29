using Carter;
using Identity.Application.CQRS.Users.Commands.UpdateProfile;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Identity.API.Endpoints.Users
{
    public record UpdateProfileRequest(string FullName, string? AvatarUrl);

    public record UpdateProfileResponse(bool IsSuccess);

    public class UpdateProfileEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/users/profile", async ([FromBody] UpdateProfileRequest request, ISender sender, ClaimsPrincipal user) =>
            {
                var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdClaim)) return Results.Unauthorized();

                var command = new UpdateProfileCommand(
                    Guid.Parse(userIdClaim),
                    request.FullName,
                    request.AvatarUrl
                );

                var result = await sender.Send(command);
                var response = result.Adapt<UpdateProfileResponse>();

                return Results.Ok(response);
            })
            .WithName("UpdateProfile")
            .WithSummary("Update user profile")
            .WithDescription("Updates full name and avatar for the authenticated user.")
            .RequireAuthorization(); 
        }
    }
}