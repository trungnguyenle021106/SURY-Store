using FluentValidation;

namespace Identity.Application.CQRS.Users.Commands.SetDefaultAddress
{
    public class SetDefaultAddressCommandValidator : AbstractValidator<SetDefaultAddressCommand>
    {
        public SetDefaultAddressCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được để trống.");
            RuleFor(x => x.AddressId).NotEmpty().WithMessage("AddressId không được để trống.");
        }
    }
}