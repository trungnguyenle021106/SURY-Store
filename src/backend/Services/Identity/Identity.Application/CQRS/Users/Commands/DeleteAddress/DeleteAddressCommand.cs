using BuildingBlocks.Core.CQRS;

namespace Identity.Application.CQRS.Users.Commands.DeleteAddress
{
    public record DeleteAddressResult(bool IsSuccess);
    public record DeleteAddressCommand(Guid UserId, Guid AddressId) : ICommand<DeleteAddressResult>;
}