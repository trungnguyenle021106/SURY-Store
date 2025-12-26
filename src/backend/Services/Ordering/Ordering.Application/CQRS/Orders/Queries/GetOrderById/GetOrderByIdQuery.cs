using BuildingBlocks.Application.MediatR.CQRS;


namespace Ordering.Application.CQRS.Orders.Queries.GetOrderById
{
    public record OrderItemDto(
        Guid ProductId,
        string ProductName,
        int Quantity,
        decimal UnitPrice,
        string PictureUrl,
        decimal SubTotal);

    public record AddressDto(
        string ReceiverName,
        string PhoneNumber,
        string Street,
        string FullAddress);

    public record OrderDto(
        Guid Id,
        DateTime OrderDate,
        string Status, 
        int StatusId, 
        decimal TotalPrice,
        int PaymentMethod,
        AddressDto ShippingAddress,
        List<OrderItemDto> OrderItems);

    public record GetOrderByIdResult(OrderDto Order);

    public record GetOrderByIdQuery(Guid Id, Guid UserId, bool IsAdmin) : IQuery<GetOrderByIdResult>;
}