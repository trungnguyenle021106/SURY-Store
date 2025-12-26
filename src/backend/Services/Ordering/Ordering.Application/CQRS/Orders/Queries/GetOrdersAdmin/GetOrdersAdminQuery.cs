using BuildingBlocks.Application.MediatR.CQRS;
using Ordering.Domain.Enums;

namespace Ordering.Application.CQRS.Orders.Queries.GetOrdersAdmin
{
    public record OrderAdminDto(
        Guid Id,
        Guid UserId,
        DateTime OrderDate,
        decimal TotalPrice,
        OrderStatus Status,
        int PaymentMethod,
        string ReceiverName,
        string PhoneNumber);

    public record GetOrdersAdminQuery(
        int PageNumber = 1,
        int PageSize = 10,
        OrderStatus? Status = null,
        string? SearchTerm = null)
        : IQuery<PaginatedResult<OrderAdminDto>>;
}