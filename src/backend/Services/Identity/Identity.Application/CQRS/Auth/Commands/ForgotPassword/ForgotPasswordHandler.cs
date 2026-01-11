using Identity.Application.Common.Interfaces;
using MediatR;

namespace Identity.Application.CQRS.Auth.Commands.ForgotPassword
{
    public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, Unit>
    {
        private readonly IIdentityService _identityService;

        public ForgotPasswordHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<Unit> Handle(ForgotPasswordCommand command, CancellationToken cancellationToken)
        {
            await _identityService.ForgotPasswordAsync(command.Email);
            return Unit.Value;
        }
    }
}