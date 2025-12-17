namespace Identity.API.Common.Models
{
    public record UserAddressResponse(
         Guid Id,
         string ReceiverName,
         string PhoneNumber,
         string Street,
         string WardDescription,
         string City,
         string FullAddress,
         bool IsDefault
     );
}
