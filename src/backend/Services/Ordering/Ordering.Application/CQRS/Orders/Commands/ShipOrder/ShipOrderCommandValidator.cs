using FluentValidation;

namespace Ordering.Application.CQRS.Orders.Commands.ShipOrder
{
    public class ShipOrderCommandValidator : AbstractValidator<ShipOrderCommand>
    {
        public ShipOrderCommandValidator()
        {
            RuleFor(x => x.OrderId).NotEmpty().WithMessage("OrderId không được để trống.");
        }
    }
}