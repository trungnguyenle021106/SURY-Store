using BuildingBlocks.Application.MediatR.CQRS;
using Ordering.Domain.Enums;

namespace Ordering.Application.CQRS.Orders.Queries.GetOrdersByCustomer
{
    public record OrderCustomerDto(
        Guid Id,
        DateTime OrderDate,
        decimal TotalPrice,
        OrderStatus Status,
        int PaymentMethod,
        string ReceiverName,
        string PhoneNumber,
        string ShippingAddress 
    );

    public record GetOrdersByCustomerQuery(
        Guid UserId, 
        int PageNumber = 1,
        int PageSize = 10,
        OrderStatus? Status = null,
        string? SearchTerm = null 
    ) : IQuery<PaginatedResult<OrderCustomerDto>>;
}