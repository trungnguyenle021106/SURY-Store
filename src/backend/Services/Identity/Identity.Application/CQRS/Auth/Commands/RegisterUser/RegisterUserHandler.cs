using Identity.Application.Common.Interfaces;
using MediatR;

namespace Identity.Application.CQRS.Auth.Commands.RegisterUser
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, RegisterUserResult>
    {
        private readonly IIdentityService _identityService;

        public RegisterUserHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<RegisterUserResult> Handle(RegisterUserCommand command, CancellationToken cancellationToken)
        {
            var userId = await _identityService.RegisterUserAsync(command.FullName, command.Email, command.Password, command.Role);
            return new RegisterUserResult(userId);
        }
    }
}