using BuildingBlocks.Core.CQRS;

namespace Identity.Application.CQRS.Users.Commands.SetDefaultAddress
{
    public record SetDefaultAddressResult(bool IsSuccess);
    public record SetDefaultAddressCommand(Guid UserId, Guid AddressId) : ICommand<SetDefaultAddressResult>;
}