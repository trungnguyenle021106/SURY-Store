using FluentValidation;

namespace Ordering.Application.CQRS.Orders.Commands.CancelOrder
{
    public class CancelOrderCommandValidator : AbstractValidator<CancelOrderCommand>
    {
        public CancelOrderCommandValidator()
        {
            RuleFor(x => x.OrderId).NotEmpty().WithMessage("OrderId là bắt buộc.");
        }
    }
}