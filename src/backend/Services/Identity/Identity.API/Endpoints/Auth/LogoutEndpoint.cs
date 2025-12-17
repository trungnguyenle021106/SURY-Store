using Carter;
using Identity.Application.CQRS.Auth.Commands.Logout;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public record LogoutRequest(string RefreshToken);
    public record LogoutResponse(bool IsSuccess);

    public class LogoutEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/logout", async ([FromBody] LogoutRequest request, ISender sender) =>
            {
                var command = new LogoutCommand(request.RefreshToken);

                var result = await sender.Send(command);

                var response = result.Adapt<LogoutResponse>();

                return Results.Ok(response);
            })
            .WithName("Logout")
            .WithSummary("Revoke Refresh Token")
            .WithDescription("Logout user by revoking the refresh token.");
        }
    }
}