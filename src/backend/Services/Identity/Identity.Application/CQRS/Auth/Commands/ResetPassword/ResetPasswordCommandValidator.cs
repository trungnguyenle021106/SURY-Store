using FluentValidation;

namespace Identity.Application.CQRS.Auth.Commands.ResetPassword
{
    public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được bỏ trống.")
                .EmailAddress().WithMessage("Email không hợp lệ.");

            RuleFor(x => x.VerifyToken)
                .NotEmpty().WithMessage("Token xác thực không được để trống.");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Mật khẩu mới không được bỏ trống.")
                .MinimumLength(6).WithMessage("Mật khẩu cần có ít nhất 6 ký tự.");
        }
    }
}