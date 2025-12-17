using Identity.Application.Common.Interfaces;
using MediatR;

namespace Identity.Application.CQRS.Auth.Commands.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, LoginResult>
    {
        private readonly IIdentityService _identityService;

        public LoginHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<LoginResult> Handle(LoginCommand command, CancellationToken cancellationToken)
        {
            var authResult = await _identityService.LoginAsync(command.Email, command.Password);
            return new LoginResult(authResult.AccessToken, authResult.RefreshToken);
        }
    }
}