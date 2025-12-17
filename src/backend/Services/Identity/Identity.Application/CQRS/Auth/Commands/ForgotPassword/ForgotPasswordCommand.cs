using BuildingBlocks.Core.CQRS;

namespace Identity.Application.CQRS.Auth.Commands.ForgotPassword
{
    public record ForgotPasswordResult(string Token);
    public record ForgotPasswordCommand(string Email) : ICommand<ForgotPasswordResult>;
}