using Carter;
using Identity.Application.CQRS.Auth.Commands.RegisterUser;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Endpoints.Auth
{
    public record RegisterUserRequest(string FullName, string Email, string Password);

    public record RegisterUserResponse(Guid Id);

    public class RegisterUserEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/register", async ([FromBody] RegisterUserRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = request.Adapt<RegisterUserCommand>();

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<RegisterUserResponse>();

                return Results.Created($"/auth/users/{response.Id}", response);
            })
            .WithName("RegisterUser")
            .WithSummary("Register a new user")
            .WithDescription("Create a new user account with email and password");
        }
    }
}