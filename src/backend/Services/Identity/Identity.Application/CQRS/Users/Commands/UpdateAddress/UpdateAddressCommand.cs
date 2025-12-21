using BuildingBlocks.Application.MediatR.CQRS;
using BuildingBlocks.Core.Enums;


namespace Identity.Application.CQRS.Users.Commands.UpdateAddress
{
    public record UpdateAddressResult(bool IsSuccess);
    public record UpdateAddressCommand(
        Guid UserId,
        Guid AddressId,
        string ReceiverName,
        string PhoneNumber,
        string Street,
        Wards Ward,
        bool IsDefault
    ) : ICommand<UpdateAddressResult>;
}