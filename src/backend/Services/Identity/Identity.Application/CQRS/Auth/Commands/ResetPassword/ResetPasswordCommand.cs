using BuildingBlocks.Core.CQRS;

namespace Identity.Application.CQRS.Auth.Commands.ResetPassword
{
    public record ResetPasswordResult(bool IsSuccess);

    public record ResetPasswordCommand(string Email, string Token, string NewPassword)
        : ICommand<ResetPasswordResult>;
}