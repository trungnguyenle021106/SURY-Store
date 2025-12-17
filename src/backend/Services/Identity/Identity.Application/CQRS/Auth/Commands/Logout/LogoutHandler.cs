using Identity.Application.Common.Interfaces;
using MediatR;

namespace Identity.Application.CQRS.Auth.Commands.Logout
{
    public class LogoutHandler : IRequestHandler<LogoutCommand, LogoutResult>
    {
        private readonly IIdentityService _identityService;

        public LogoutHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<LogoutResult> Handle(LogoutCommand command, CancellationToken cancellationToken)
        {
            await _identityService.RevokeTokenAsync(command.RefreshToken);
            return new LogoutResult(true);
        }
    }
}