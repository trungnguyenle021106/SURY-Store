using BuildingBlocks.Application.MediatR.CQRS;
using BuildingBlocks.Core.Enums;

namespace Identity.Application.CQRS.Users.Queries.GetAddressById
{
    public record UserAddressDto(
        Guid Id,
        string ReceiverName,
        string PhoneNumber,
        string Street,
        Wards Ward,
        string WardDescription,
        string City,
        string FullAddress,
        bool IsDefault
    );

    public record GetAddressByIdResult(UserAddressDto Address);

    public record GetAddressByIdQuery(Guid UserId, Guid AddressId) : IQuery<GetAddressByIdResult>;
}