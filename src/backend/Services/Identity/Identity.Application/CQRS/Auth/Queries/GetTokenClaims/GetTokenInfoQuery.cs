using BuildingBlocks.Application.MediatR.CQRS;
using System.Security.Claims;

namespace Identity.Application.CQRS.Auth.Queries.GetTokenInfo
{
    public record TokenInfoDto(
        Guid Id,
        string FullName,
        string Email,
        List<string> Roles
    );

    public record GetTokenInfoResult(TokenInfoDto UserInfo);

    public record GetTokenInfoQuery(ClaimsPrincipal Principal) : IQuery<GetTokenInfoResult>;
}