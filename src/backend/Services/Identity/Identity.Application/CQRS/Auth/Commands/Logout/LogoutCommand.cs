using BuildingBlocks.Application.MediatR.CQRS;

namespace Identity.Application.CQRS.Auth.Commands.Logout
{
    public record LogoutResult(bool IsSuccess);

    public record LogoutCommand(string RefreshToken) : ICommand<LogoutResult>;
}