using BuildingBlocks.Application.MediatR.CQRS;

namespace Identity.Application.CQRS.Users.Commands.UpdateProfile
{
    public record UpdateProfileResult(bool IsSuccess);

    public record UpdateProfileCommand(
        Guid UserId,
        string FullName,
        string? AvatarUrl) : ICommand<UpdateProfileResult>;
}