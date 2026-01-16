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
            app.MapGet("/auth/verify-email", async (
                [FromQuery] string userId,
                [FromQuery] string code,
                ISender sender,
                ILogger<VerifyEmailEndpoint> logger) =>
            {
                try
                {
                    var command = new VerifyEmailCommand(userId, code);
                    await sender.Send(command);

                    return Results.Redirect("https://sury.store/auth/login?verifyStatus=success");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Lỗi xác thực email thất bại cho User: {UserId}. Lỗi: {Message}", userId, ex.Message);

                    return Results.Redirect("https://sury.store/auth/login?verifyStatus=failed");
                }
            })
            .WithName("VerifyEmail")
            .WithSummary("Confirm user email address");
        }
    }
}