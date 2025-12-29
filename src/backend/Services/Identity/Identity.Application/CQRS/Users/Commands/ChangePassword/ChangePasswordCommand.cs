using BuildingBlocks.Application.MediatR.CQRS;

namespace Identity.Application.CQRS.Users.Commands.ChangePassword
{
    public record ChangePasswordResult(bool IsSuccess, string? Message = null);

    public record ChangePasswordCommand(
        Guid UserId,
        string CurrentPassword,
        string NewPassword) : ICommand<ChangePasswordResult>;
}