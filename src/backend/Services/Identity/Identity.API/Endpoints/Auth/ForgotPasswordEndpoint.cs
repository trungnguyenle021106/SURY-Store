using Carter;
using Identity.Application.CQRS.Auth.Commands.ForgotPassword;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public record ForgotPasswordRequest(string Email);
    public record ForgotPasswordResponse(string Message);

    public class ForgotPasswordEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/forgot-password", async ([FromBody] ForgotPasswordRequest request, ISender sender) =>
            {
                var command = new ForgotPasswordCommand(request.Email);

                await sender.Send(command);

                return Results.Ok();
            })
            .WithName("ForgotPassword")
            .WithSummary("Request password reset")
            .WithDescription("Sends a password reset link via email.");
        }
    }
}