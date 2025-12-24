using FluentValidation;

namespace Ordering.Application.CQRS.Orders.Commands.StartOrderProcessing
{
    public class StartOrderProcessingCommandValidator : AbstractValidator<StartOrderProcessingCommand>
    {
        public StartOrderProcessingCommandValidator()
        {
            RuleFor(x => x.OrderId)
                .NotEmpty().WithMessage("OrderId là bắt buộc.");
        }
    }
}