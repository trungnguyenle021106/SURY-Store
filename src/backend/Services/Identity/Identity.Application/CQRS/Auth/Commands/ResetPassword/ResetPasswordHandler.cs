using Identity.Application.Common.Interfaces;
using MediatR;

namespace Identity.Application.CQRS.Auth.Commands.ResetPassword
{
    public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, ResetPasswordResult>
    {
        private readonly IIdentityService _identityService;

        public ResetPasswordHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<ResetPasswordResult> Handle(ResetPasswordCommand command, CancellationToken cancellationToken)
        {
            await _identityService.ResetPasswordAsync(command.Email, command.Token, command.NewPassword);
            return new ResetPasswordResult(true);
        }
    }
}