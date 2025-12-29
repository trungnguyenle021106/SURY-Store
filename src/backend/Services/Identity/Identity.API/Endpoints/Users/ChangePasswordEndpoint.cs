using Carter;
using Identity.Application.CQRS.Users.Commands.ChangePassword;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Identity.API.Endpoints.Users
{
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    public record ChangePasswordResponse(bool IsSuccess, string? Message);

    public class ChangePasswordEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/users/change-password", async ([FromBody] ChangePasswordRequest request, ISender sender, ClaimsPrincipal user) =>
            {
                var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdClaim)) return Results.Unauthorized();

                var command = new ChangePasswordCommand(
                    Guid.Parse(userIdClaim),
                    request.CurrentPassword,
                    request.NewPassword
                );

                var result = await sender.Send(command);

                if (!result.IsSuccess)
                    return Results.BadRequest(new ChangePasswordResponse(false, result.Message));

                return Results.Ok(new ChangePasswordResponse(true, result.Message));
            })
            .WithName("ChangePassword")
            .WithSummary("Change user password")
            .WithDescription("Allows authenticated users to change their own password.")
            .RequireAuthorization(); 
        }
    }
}