using BuildingBlocks.Application.MediatR.CQRS;

namespace Identity.Application.CQRS.Auth.Commands.VerifyEmail
{
    public record VerifyEmailCommand(string UserId, string Code) : ICommand<bool>;
}