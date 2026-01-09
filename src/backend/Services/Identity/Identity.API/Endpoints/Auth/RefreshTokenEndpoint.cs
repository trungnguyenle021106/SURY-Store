using Carter;
using Identity.Application.CQRS.Auth.Commands.RefreshToken;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public class RefreshTokenEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/refresh-token", async (ISender sender, HttpContext context, CancellationToken cancellationToken) =>
            {
                if (!context.Request.Cookies.TryGetValue("refresh_token", out var currentRefreshToken))
                {
                    return Results.Unauthorized();
                }

                var command = new RefreshTokenCommand(currentRefreshToken);

                var result = await sender.Send(command, cancellationToken);

                var baseCookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Strict,
                };

                context.Response.Cookies.Append("access_token", result.AccessToken, new CookieOptions
                {
                    HttpOnly = baseCookieOptions.HttpOnly,
                    Secure = baseCookieOptions.Secure,
                    SameSite = baseCookieOptions.SameSite,
                    Expires = DateTime.UtcNow.AddMinutes(15)
                });

                context.Response.Cookies.Append("refresh_token", result.RefreshToken, new CookieOptions
                {
                    HttpOnly = baseCookieOptions.HttpOnly,
                    Secure = baseCookieOptions.Secure,
                    SameSite = baseCookieOptions.SameSite,
                    Expires = DateTime.UtcNow.AddDays(7)
                });

                return Results.Ok();
            })
            .WithName("RefreshToken")
            .WithSummary("Refresh Access Token via Cookie")
            .WithDescription("Exchange a valid Refresh Token cookie for a new pair of Access & Refresh Token cookies");
        }
    }
}