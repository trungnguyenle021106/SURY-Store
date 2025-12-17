using Carter;
using Identity.Application.CQRS.Auth.Commands.RefreshToken;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public record RefreshTokenRequest(string RefreshToken);

    public record RefreshTokenResponse(string AccessToken, string RefreshToken);

    public class RefreshTokenEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/refresh-token", async ([FromBody] RefreshTokenRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = new RefreshTokenCommand(request.RefreshToken);

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<RefreshTokenResponse>();

                return Results.Ok(response);
            })
            .WithName("RefreshToken")
            .WithSummary("Refresh Access Token")
            .WithDescription("Exchange a valid Refresh Token for a new pair of Access Token and Refresh Token");
        }
    }
}