using Identity.Application.Common.Interfaces;
using MediatR;

namespace Identity.Application.CQRS.Auth.Commands.RefreshToken
{
    public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResult>
    {
        private readonly IIdentityService _identityService;

        public RefreshTokenHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<RefreshTokenResult> Handle(RefreshTokenCommand command, CancellationToken cancellationToken)
        {
            var authResult = await _identityService.RefreshTokenAsync(command.RefreshToken);

            return new RefreshTokenResult(authResult.AccessToken, authResult.RefreshToken);
        }
    }
}