using BuildingBlocks.Core.Enums;

namespace Ordering.Domain.ValueObjects
{
    public record Address(
        string ReceiverName,
        string PhoneNumber,
        string Street,
        Wards Ward,
        string City,
        string? Note);
}