using BuildingBlocks.Application.MediatR.CQRS;
using Ordering.Domain.Enums;

namespace Ordering.Application.CQRS.Orders.Queries.GetOrdersByUserId
{
    public record OrderItemDto(
        Guid ProductId,
        string ProductName,
        int Quantity,
        decimal UnitPrice,
        string PictureUrl);

    public record AddressDto(
        string ReceiverName,
        string PhoneNumber,
        string Street,
        string FullAddress);

    public record OrderDto(
        Guid Id,
        DateTime OrderDate,
        OrderStatus Status,
        decimal TotalPrice,
        int PaymentMethod,
        AddressDto ShippingAddress,
        List<OrderItemDto> OrderItems);

    public record GetOrdersByUserIdResult(IEnumerable<OrderDto> Orders);

    public record GetOrdersByUserIdQuery(Guid UserId) : IQuery<GetOrdersByUserIdResult>;
}