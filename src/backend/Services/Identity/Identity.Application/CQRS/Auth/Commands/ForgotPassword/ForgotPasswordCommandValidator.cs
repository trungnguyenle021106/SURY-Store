using FluentValidation;

namespace Identity.Application.CQRS.Auth.Commands.ForgotPassword
{
    public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
    {
        public ForgotPasswordCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được bỏ trống.")
                .EmailAddress().WithMessage("Email không hợp lệ.");
        }
    }
}