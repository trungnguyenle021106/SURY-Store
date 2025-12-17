using Carter;
using Identity.Application.CQRS.Auth.Commands.Login;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public record LoginRequest(string Email, string Password);
    public record LoginResponse(string AccessToken, string RefreshToken);

    public class LoginEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/login", async ([FromBody] LoginRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = request.Adapt<LoginCommand>();

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<LoginResponse>();

                return Results.Ok(response);
            })
            .WithName("Login")
            .WithSummary("User Login")
            .WithDescription("Authenticate user and return Access Token & Refresh Token");
        }
    }
}