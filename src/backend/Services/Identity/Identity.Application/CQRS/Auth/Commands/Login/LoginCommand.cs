using BuildingBlocks.Core.CQRS;

namespace Identity.Application.CQRS.Auth.Commands.Login
{
    public record LoginResult(string AccessToken, string RefreshToken);

    public record LoginCommand(string Email, string Password) : ICommand<LoginResult>;
}