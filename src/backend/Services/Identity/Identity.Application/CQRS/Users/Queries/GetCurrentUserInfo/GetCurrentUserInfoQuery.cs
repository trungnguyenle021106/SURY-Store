using BuildingBlocks.Application.MediatR.CQRS;

namespace Identity.Application.CQRS.Users.Queries.GetCurrentUserInfo
{

    public record UserAddressDto(
        Guid Id,
        string ReceiverName,
        string PhoneNumber,
        string Street,
        string FullAddress,
        bool IsDefault);

    public record UserInfoDto(
        Guid Id,
        string FullName,
        string Email,
        string? AvatarUrl,
        List<UserAddressDto> Addresses);

    public record GetCurrentUserInfoResult(UserInfoDto User);
    public record GetCurrentUserInfoQuery(Guid UserId) : IQuery<GetCurrentUserInfoResult>;

}