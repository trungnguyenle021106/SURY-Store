using FluentValidation;

namespace Identity.Application.CQRS.Auth.Commands.VerifyEmail
{
    public class VerifyEmailCommandValidator : AbstractValidator<VerifyEmailCommand>
    {
        public VerifyEmailCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId không được để trống.")
                .Must(BeAValidGuid).WithMessage("UserId sai định dạng Guid.");

            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Mã xác thực (Token) không được để trống.");
        }

        private bool BeAValidGuid(string id)
        {
            return Guid.TryParse(id, out _);
        }
    }
}