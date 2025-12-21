using BuildingBlocks.Application.MediatR.CQRS;

namespace Identity.Application.CQRS.Auth.Commands.RegisterUser
{
    public record RegisterUserResult(Guid Id);

    public record RegisterUserCommand(string FullName, string Email, string Password)
        : ICommand<RegisterUserResult>;
}