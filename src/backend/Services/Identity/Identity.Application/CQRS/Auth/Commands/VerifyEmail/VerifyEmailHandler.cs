using Identity.Application.Common.Interfaces;
using MediatR;

namespace Identity.Application.CQRS.Auth.Commands.VerifyEmail
{
    public class VerifyEmailHandler : IRequestHandler<VerifyEmailCommand, bool>
    {
        private readonly IIdentityService _identityService;

        public VerifyEmailHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<bool> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
        {
            await _identityService.ConfirmEmailAsync(request.UserId, request.Code);
            return true;
        }
    }
}
