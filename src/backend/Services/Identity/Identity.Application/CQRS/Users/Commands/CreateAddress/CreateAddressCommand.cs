using BuildingBlocks.Application.MediatR.CQRS;
using BuildingBlocks.Core.Enums;


namespace Identity.Application.CQRS.Users.Commands.CreateAddress
{
    public record CreateAddressResult(Guid Id);
    public record CreateAddressCommand(
        Guid UserId,
        string ReceiverName,
        string PhoneNumber,
        string Street,
        Wards Ward,
        bool IsDefault
    ) : ICommand<CreateAddressResult>;
}