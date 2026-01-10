using Carter;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Identity.Application.CQRS.Auth.Commands.VerifyEmail;

namespace Identity.API.Endpoints.Auth
{
    public class VerifyEmailEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/auth/verify-email", async ([FromQuery] string userId, [FromQuery] string code, ISender sender) =>
            {
                var command = new VerifyEmailCommand(userId, code);

                await sender.Send(command);

                return Results.Redirect($"http://sury.store/login?status=success");
            })
            .WithName("VerifyEmail")
            .WithSummary("Confirm user email address");
        }
    }
}