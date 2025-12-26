using FluentValidation;

namespace Ordering.Application.CQRS.Orders.Commands.CompleteOrder
{
    public class CompleteOrderCommandValidator : AbstractValidator<CompleteOrderCommand>
    {
        public CompleteOrderCommandValidator()
        {
            RuleFor(x => x.OrderId).NotEmpty().WithMessage("OrderId là bắt buộc.");
        }
    }
}