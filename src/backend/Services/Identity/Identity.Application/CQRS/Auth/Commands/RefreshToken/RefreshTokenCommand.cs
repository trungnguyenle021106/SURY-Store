using BuildingBlocks.Core.CQRS;

namespace Identity.Application.CQRS.Auth.Commands.RefreshToken
{
    public record RefreshTokenResult(string AccessToken, string RefreshToken);

    public record RefreshTokenCommand(string RefreshToken) : ICommand<RefreshTokenResult>;
}