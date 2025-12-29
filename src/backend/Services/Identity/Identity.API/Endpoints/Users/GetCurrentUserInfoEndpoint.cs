using Carter;
using Identity.Application.CQRS.Users.Queries.GetCurrentUserInfo;
using Mapster;
using MediatR;
using System.Security.Claims;

namespace Identity.API.Endpoints.Users
{
    public class GetCurrentUserInfoEndpoint : ICarterModule
    {
        private record UserAddressDto(
              Guid Id,
              string ReceiverName,
              string PhoneNumber,
              string Street,
              string FullAddress,
              bool IsDefault);

        private record GetCurrentUserInfoResponse(Guid Id,
            string FullName,
            string Email,
            string? AvatarUrl,
            List<UserAddressDto> Addresses);

        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/users/me", async (ISender sender, ClaimsPrincipal user) =>
            {
                var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userIdClaim))
                    return Results.Unauthorized();

                var query = new GetCurrentUserInfoQuery(Guid.Parse(userIdClaim));
                var result = await sender.Send(query);

                var response = result.Adapt<GetCurrentUserInfoResponse>();

                return Results.Ok(response);
            })
            .WithName("GetCurrentUserInfo")
            .WithSummary("Get current logged in user info")
            .WithDescription("Returns profile details for the authenticated user based on their token.")
            .RequireAuthorization();
        }
    }
}