using Carter;
using Identity.Application.CQRS.Auth.Commands.ForgotPassword;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public record ForgotPasswordRequest(string Email);
    public record ForgotPasswordResponse(string Token);

    public class ForgotPasswordEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/forgot-password", async ([FromBody] ForgotPasswordRequest request, ISender sender) =>
            {
                var command = new ForgotPasswordCommand(request.Email);

                var result = await sender.Send(command);

                var response = result.Adapt<ForgotPasswordResponse>();

                return Results.Ok(response);
            })
            .WithName("ForgotPassword")
            .WithSummary("Request password reset")
            .WithDescription("Generate a password reset token (Returned in response for Dev testing).");
        }
    }
}