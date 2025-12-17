using Carter;
using Identity.Application.CQRS.Auth.Commands.ResetPassword;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public record ResetPasswordRequest(string Email, string Token, string NewPassword);
    public record ResetPasswordResponse(bool IsSuccess);

    public class ResetPasswordEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/reset-password", async ([FromBody] ResetPasswordRequest request, ISender sender) =>
            {
                var command = request.Adapt<ResetPasswordCommand>();

                var result = await sender.Send(command);

                var response = result.Adapt<ResetPasswordResponse>();

                return Results.Ok(response);
            })
            .WithName("ResetPassword")
            .WithSummary("Reset User Password")
            .WithDescription("Set a new password using the reset token received via email.");
        }
    }
}