using Carter;
using Identity.Application.CQRS.Auth.Commands.Login;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public record LoginRequest(string Email, string Password);


    public class LoginEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/login", async ([FromBody] LoginRequest request, ISender sender, HttpContext context, CancellationToken cancellationToken) =>
            {
                var command = request.Adapt<LoginCommand>();

                var result = await sender.Send(command, cancellationToken);

                context.Response.Cookies.Append("access_token", result.AccessToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddMinutes(15) 
                });

                context.Response.Cookies.Append("refresh_token", result.RefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(7) 
                });

                return Results.Ok();
            })
            .WithName("Login")
            .WithSummary("User Login")
            .WithDescription("Authenticate user and set HttpOnly Cookies");
        }
    }
}