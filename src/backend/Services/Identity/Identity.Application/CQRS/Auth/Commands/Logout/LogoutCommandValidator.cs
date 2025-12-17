using FluentValidation;

namespace Identity.Application.CQRS.Auth.Commands.Logout
{
    public class LogoutCommandValidator : AbstractValidator<LogoutCommand>
    {
        public LogoutCommandValidator()
        {
            RuleFor(x => x.RefreshToken)
                .NotEmpty().WithMessage("Refresh Token là cần thiết để đăng xuất.");
        }
    }
}