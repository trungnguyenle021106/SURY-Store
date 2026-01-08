using Carter;
using Identity.Application.CQRS.Auth.Queries.GetTokenInfo;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Identity.API.Endpoints.Auth
{
    public class GetTokenInfoEndpoint : ICarterModule
    {
        private record GetTokenInfoResponse(
            Guid Id,
            string FullName,
            string Email,
            List<string> Roles
        );

        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/auth/info", async (ISender sender, ClaimsPrincipal user) =>
            {
                if (user.Identity == null || !user.Identity.IsAuthenticated)
                {
                    return Results.Unauthorized();
                }

                var query = new GetTokenInfoQuery(user);
                var result = await sender.Send(query);

                var response = result.UserInfo.Adapt<GetTokenInfoResponse>();

                return Results.Ok(response);
            })
            .WithName("GetTokenInfo")
            .WithSummary("Get info from current token")
            .RequireAuthorization();
        }
    }
}