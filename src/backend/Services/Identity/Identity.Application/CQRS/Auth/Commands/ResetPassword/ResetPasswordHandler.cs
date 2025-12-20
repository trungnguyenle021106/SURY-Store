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
            await _identityService.ResetPasswordAsync(command.Email, command.VerifyToken, command.NewPassword);
            return new ResetPasswordResult(true);
        }
    }
}