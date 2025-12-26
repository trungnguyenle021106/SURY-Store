using BuildingBlocks.Application.MediatR.CQRS;

namespace Ordering.Application.CQRS.Orders.Commands.CreateOrder
{
    public record AddressDto(
        string ReceiverName,
        string PhoneNumber,
        string Street,
        int Ward, 
        string City,
        string? Note);

    public record OrderItemDto(
        Guid ProductId,
        string ProductName,
        decimal UnitPrice,
        int Quantity,
        string PictureUrl);

    public record CreateOrderResult(Guid Id);

    public record CreateOrderCommand(
        Guid OrderId,
        Guid UserId,
        decimal TotalPrice,
        AddressDto ShippingAddress,
        int PaymentMethod,
        List<OrderItemDto> OrderItems
    ) : ICommand<CreateOrderResult>;
}