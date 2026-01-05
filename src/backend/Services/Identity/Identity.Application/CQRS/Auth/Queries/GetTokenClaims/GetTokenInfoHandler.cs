using BuildingBlocks.Infrastructure.Extensions;
using MediatR;

namespace Identity.Application.CQRS.Auth.Queries.GetTokenInfo
{
    public class GetTokenInfoHandler : IRequestHandler<GetTokenInfoQuery, GetTokenInfoResult>
    {
        public Task<GetTokenInfoResult> Handle(GetTokenInfoQuery query, CancellationToken cancellationToken)
        {
            var userId = query.Principal.GetUserId();
            var email = query.Principal.GetEmail();
            var name = query.Principal.GetName();
            var roles = query.Principal.GetRoles();

            var tokenInfo = new TokenInfoDto(
                Id: userId,
                FullName: name,
                Email: email,
                Roles: roles
            );

            return Task.FromResult(new GetTokenInfoResult(tokenInfo));
        }
    }
}