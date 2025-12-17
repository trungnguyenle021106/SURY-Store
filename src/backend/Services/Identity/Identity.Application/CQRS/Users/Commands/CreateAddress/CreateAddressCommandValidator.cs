using FluentValidation;

namespace Identity.Application.CQRS.Users.Commands.CreateAddress
{
    public class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
    {
        public CreateAddressCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được để trống.");

            RuleFor(x => x.ReceiverName)
                .NotEmpty().WithMessage("Tên người nhận không được để trống.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Số điện thoại không được để trống.")
                .Matches(@"^\d{10,11}$").WithMessage("Số điện thoại không hợp lệ.");

            RuleFor(x => x.Street)
                .NotEmpty().WithMessage("Tên đường/số nhà không được để trống.");

            RuleFor(x => x.Ward)
                .IsInEnum().WithMessage("Phường xã không hợp lệ.");
        }
    }
}