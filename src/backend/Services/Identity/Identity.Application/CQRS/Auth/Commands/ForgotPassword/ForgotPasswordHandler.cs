using Identity.Application.Common.Interfaces;
using MediatR;

namespace Identity.Application.CQRS.Auth.Commands.ForgotPassword
{
    public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, ForgotPasswordResult>
    {
        private readonly IIdentityService _identityService;

        public ForgotPasswordHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<ForgotPasswordResult> Handle(ForgotPasswordCommand command, CancellationToken cancellationToken)
        {
            var token = await _identityService.ForgotPasswordAsync(command.Email);
            return new ForgotPasswordResult(token);
        }
    }
}