using BuildingBlocks.Application.MediatR.CQRS;
using BuildingBlocks.Core.Enums;

namespace Identity.Application.CQRS.Users.Queries.GetUserAddresses
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

    public record GetUserAddressesResult(IEnumerable<UserAddressDto> Addresses);
    public record GetUserAddressesQuery(Guid UserId) : IQuery<GetUserAddressesResult>;
}